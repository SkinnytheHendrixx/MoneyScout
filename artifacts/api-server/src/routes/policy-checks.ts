import { lookup } from "node:dns/promises";
import net from "node:net";
import Anthropic from "@anthropic-ai/sdk";
import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import {
  db,
  evidenceTable,
  opportunitiesTable,
  policyChecksTable,
} from "@workspace/db";
import {
  ListPolicyChecksParams,
  ListPolicyChecksResponse,
  RunPolicyCheckParams,
  RunPolicyCheckResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const runningChecks = new Set<number>();
const MAX_DOCUMENTS = 4;
const MAX_DOCUMENT_CHARS = 120_000;
const MAX_EXCERPT_CHARS = 8_000;
const MAX_TOTAL_EXCERPT_CHARS = 32_000;
const MAX_ESTIMATED_COST_USD = 0.5;
const SONNET_INPUT_COST_PER_TOKEN = 0.000002;
const SONNET_OUTPUT_COST_PER_TOKEN = 0.00001;
const WEB_SEARCH_COST_PER_USE = 0.01;
const ALLOWED_DIMENSIONS = new Set([
  "terms_of_service",
  "developer_api_terms",
  "scraping_automation_restrictions",
  "robots_crawler_restrictions",
  "data_resale_restrictions",
  "privacy_concerns",
  "authentication_access_restrictions",
]);

type PolicyStatus = "GREEN" | "YELLOW" | "RED" | "UNKNOWN";
type Finding = {
  claim: string;
  source_url: string;
  source_title: string;
  evaluation_dimension: string;
};
type PolicyAnalysis = {
  status: PolicyStatus;
  summary: string;
  findings: Finding[];
};
type RetrievedDocument = {
  url: string;
  title: string;
  excerpt: string;
};
type ValidSource = {
  url: string;
  title: string;
};

const toApi = (row: typeof policyChecksTable.$inferSelect) => ({
  id: row.id,
  opportunity_id: row.opportunityId,
  status: row.status,
  summary: row.summary,
  checked_at: row.checkedAt.toISOString(),
  retrieval_method: row.retrievalMethod as
    | "HTTP"
    | "HTTP_AND_WEB_SEARCH"
    | "HTTP_AND_BROWSERBASE"
    | "HTTP_INSUFFICIENT",
  evidence_created: row.evidenceCreated,
  external_cost_usd: row.externalCostUsd,
  ai_input_tokens: row.aiInputTokens,
  ai_output_tokens: row.aiOutputTokens,
});

const isPrivateAddress = (address: string): boolean => {
  if (net.isIP(address) === 4) {
    const parts = address.split(".").map(Number);
    return (
      parts[0] === 10 ||
      parts[0] === 127 ||
      (parts[0] === 169 && parts[1] === 254) ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      parts[0] === 0
    );
  }
  const normalized = address.toLowerCase();
  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  );
};

const assertPublicUrl = async (urlValue: string): Promise<URL> => {
  const url = new URL(urlValue);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Only HTTP(S) policy sources are supported");
  }
  const addresses = await lookup(url.hostname, { all: true });
  if (addresses.length === 0 || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error("Private network destinations are not allowed");
  }
  return url;
};

const registrableDomain = (hostname: string): string => {
  const parts = hostname.toLowerCase().replace(/^www\./, "").split(".");
  if (parts.length <= 2) return parts.join(".");
  const secondLevelSuffixes = new Set(["ac", "co", "com", "edu", "gov", "net", "org"]);
  const suffixLength =
    parts.at(-1)?.length === 2 && secondLevelSuffixes.has(parts.at(-2) ?? "") ? 3 : 2;
  return parts.slice(-suffixLength).join(".");
};

const normalizeSourceUrl = (value: string): string | null => {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
};

const fetchPublicText = async (initialUrl: string): Promise<{ url: string; text: string; contentType: string }> => {
  let current = initialUrl;
  for (let redirect = 0; redirect <= 3; redirect += 1) {
    await assertPublicUrl(current);
    const response = await fetch(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(8_000),
      headers: {
        "User-Agent": "MoneyScout-PolicyReview/1.0 (+manual human review)",
        Accept: "text/html,text/plain,application/xhtml+xml",
      },
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Redirect missing destination");
      current = new URL(location, current).toString();
      continue;
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (contentLength > 1_500_000) throw new Error("Policy document is too large");
    const text = (await response.text()).slice(0, MAX_DOCUMENT_CHARS);
    return {
      url: response.url || current,
      text,
      contentType: response.headers.get("content-type") ?? "",
    };
  }
  throw new Error("Too many redirects");
};

const decodeHtml = (value: string): string =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

const textFromHtml = (html: string): string =>
  decodeHtml(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();

const extractTitle = (html: string, fallback: string): string => {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? textFromHtml(match[1]).slice(0, 240) : fallback;
};

const policyExcerpt = (text: string): string => {
  const plain = textFromHtml(text);
  const keywords =
    /(terms|developer|api|scrap|crawl|robot|automat|resale|redistribut|privacy|personal data|authenticate|login|access|prohibit|restrict)/i;
  const sentences = plain.split(/(?<=[.!?])\s+/);
  const relevant: string[] = [];
  for (let index = 0; index < sentences.length; index += 1) {
    if (!keywords.test(sentences[index])) continue;
    const start = Math.max(0, index - 1);
    const end = Math.min(sentences.length, index + 2);
    relevant.push(sentences.slice(start, end).join(" "));
    if (relevant.join("\n").length >= MAX_EXCERPT_CHARS) break;
  }
  return (relevant.length ? relevant.join("\n") : plain).slice(0, MAX_EXCERPT_CHARS);
};

const discoverPolicyLinks = (html: string, baseUrl: string): string[] => {
  const links: string[] = [];
  const pattern = /href\s*=\s*["']([^"'#]+)["']/gi;
  const policyWords = /(terms|tos|legal|privacy|developer|api|policy|robots)/i;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    if (!policyWords.test(match[1])) continue;
    try {
      const url = new URL(match[1], baseUrl);
      if (url.protocol === "https:" || url.protocol === "http:") links.push(url.toString());
    } catch {
      // Ignore malformed links from untrusted pages.
    }
  }
  return [...new Set(links)];
};

const retrievePolicyDocuments = async (sourceUrl: string): Promise<RetrievedDocument[]> => {
  const origin = (await assertPublicUrl(sourceUrl)).origin;
  const first = await fetchPublicText(sourceUrl);
  const documents: RetrievedDocument[] = [];
  const addDocument = (url: string, title: string, rawText: string) => {
    const excerpt = policyExcerpt(rawText);
    if (excerpt.length >= 120) documents.push({ url, title, excerpt });
  };

  addDocument(first.url, extractTitle(first.text, "Source page"), first.text);
  const discovered = discoverPolicyLinks(first.text, first.url);
  const defaults = [
    `${origin}/terms`,
    `${origin}/privacy`,
    `${origin}/robots.txt`,
  ];
  const candidates = [...new Set([...discovered, ...defaults])]
    .filter((url) => url !== first.url)
    .slice(0, MAX_DOCUMENTS - 1);

  for (const candidate of candidates) {
    try {
      const result = await fetchPublicText(candidate);
      addDocument(
        result.url,
        candidate.endsWith("/robots.txt")
          ? "robots.txt"
          : extractTitle(result.text, new URL(result.url).pathname),
        result.text,
      );
    } catch {
      // A failed direct fetch is not retried. The bounded check continues with available sources.
    }
  }
  return documents.slice(0, MAX_DOCUMENTS);
};

const parseAnalysis = (text: string, validSources: Map<string, ValidSource>): PolicyAnalysis => {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const raw = JSON.parse(cleaned) as Partial<PolicyAnalysis>;
  const statuses = new Set(["GREEN", "YELLOW", "RED", "UNKNOWN"]);
  if (!raw.status || !statuses.has(raw.status) || typeof raw.summary !== "string") {
    throw new Error("Invalid policy analysis response");
  }
  const findings: Finding[] = [];
  if (Array.isArray(raw.findings)) {
    for (const finding of raw.findings) {
      if (
        typeof finding?.claim !== "string" ||
        finding.claim.length === 0 ||
        typeof finding.source_url !== "string" ||
        typeof finding.evaluation_dimension !== "string" ||
        !ALLOWED_DIMENSIONS.has(finding.evaluation_dimension)
      ) {
        continue;
      }
      const normalized = normalizeSourceUrl(finding.source_url);
      const source = normalized ? validSources.get(normalized) : undefined;
      if (!source) continue;
      findings.push({
        claim: finding.claim,
        source_url: source.url,
        source_title: source.title,
        evaluation_dimension: finding.evaluation_dimension,
      });
    }
  }
  return {
    status: raw.status,
    summary: raw.summary.slice(0, 1_500),
    findings: findings.slice(0, 20),
  };
};

const directSources = (documents: RetrievedDocument[]): Map<string, ValidSource> =>
  new Map(
    documents.flatMap((document) => {
      const normalized = normalizeSourceUrl(document.url);
      return normalized
        ? [[normalized, { url: document.url, title: document.title }] as const]
        : [];
    }),
  );

const citedWebSources = (
  message: Anthropic.Message,
  officialDomain: string,
): Map<string, ValidSource> => {
  const sources = new Map<string, ValidSource>();
  for (const block of message.content) {
    if (block.type !== "text" || !block.citations) continue;
    for (const citation of block.citations) {
      if (citation.type !== "web_search_result_location") continue;
      const normalized = normalizeSourceUrl(citation.url);
      if (!normalized) continue;
      const hostname = new URL(normalized).hostname.toLowerCase();
      if (hostname !== officialDomain && !hostname.endsWith(`.${officialDomain}`)) continue;
      sources.set(normalized, {
        url: citation.url,
        title: citation.title ?? hostname,
      });
    }
  }
  return sources;
};

const saveUnknown = async (
  opportunityId: number,
  summary: string,
  retrievalMethod: "HTTP_INSUFFICIENT",
) => {
  const [row] = await db
    .insert(policyChecksTable)
    .values({
      opportunityId,
      status: "UNKNOWN",
      summary,
      retrievalMethod,
      evidenceCreated: 0,
      externalCostUsd: 0,
    })
    .returning();
  return row;
};

router.get("/opportunities/:opportunityId/policy-checks", async (req, res): Promise<void> => {
  const params = ListPolicyChecksParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const rows = await db
    .select()
    .from(policyChecksTable)
    .where(eq(policyChecksTable.opportunityId, params.data.opportunityId))
    .orderBy(desc(policyChecksTable.checkedAt));
  res.json(ListPolicyChecksResponse.parse(rows.map(toApi)));
});

router.post("/opportunities/:opportunityId/policy-checks", async (req, res): Promise<void> => {
  const params = RunPolicyCheckParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const opportunityId = params.data.opportunityId;
  if (runningChecks.has(opportunityId)) {
    res.status(409).json({ error: "A policy check is already running for this opportunity" });
    return;
  }

  const [opportunity] = await db
    .select()
    .from(opportunitiesTable)
    .where(eq(opportunitiesTable.id, opportunityId));
  if (!opportunity) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }

  runningChecks.add(opportunityId);
  try {
    let documents: RetrievedDocument[];
    try {
      documents = await retrievePolicyDocuments(opportunity.sourceUrl);
    } catch {
      documents = [];
    }

    const totalExcerptChars = documents.reduce((sum, document) => sum + document.excerpt.length, 0);
    const directEvidenceSufficient = documents.length > 0 && totalExcerptChars >= 240;
    const excerpts = directEvidenceSufficient
      ? documents
          .map(
            (document, index) =>
              `SOURCE ${index + 1}\nURL: ${document.url}\nTITLE: ${document.title}\nEXCERPT:\n${document.excerpt}`,
          )
          .join("\n\n")
          .slice(0, MAX_TOTAL_EXCERPT_CHARS)
      : "";

    const estimatedInputTokens = Math.ceil(excerpts.length / 4) + 1_500;
    const conservativeEstimatedCost =
      estimatedInputTokens * SONNET_INPUT_COST_PER_TOKEN +
      1_500 * SONNET_OUTPUT_COST_PER_TOKEN +
      (directEvidenceSufficient ? 0 : WEB_SEARCH_COST_PER_USE);
    if (conservativeEstimatedCost > MAX_ESTIMATED_COST_USD) {
      const unknown = await saveUnknown(
        opportunityId,
        "The bounded policy corpus would exceed the configured $0.50 conservative external-service estimate. The check stopped before using Claude.",
        "HTTP_INSUFFICIENT",
      );
      await db
        .update(opportunitiesTable)
        .set({ policyStatus: "UNKNOWN" })
        .where(eq(opportunitiesTable.id, opportunityId));
      res.status(201).json(RunPolicyCheckResponse.parse(toApi(unknown)));
      return;
    }

    const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
    const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
    if (!apiKey || !baseURL) throw new Error("Replit Anthropic integration is not configured");
    const anthropic = new Anthropic({ apiKey, baseURL });
    const officialDomain = registrableDomain(new URL(opportunity.sourceUrl).hostname);
    const retrievalInstructions = directEvidenceSufficient
      ? `Use only the supplied SOURCE excerpts. Every finding must cite an exact URL from a SOURCE block.

${excerpts}`
      : `Direct HTTP retrieval did not produce enough authoritative policy text. You must use web_search exactly once.
Search only for authoritative first-party policy material on ${officialDomain}, prioritizing terms, legal, privacy, developer/API, help, authentication/access, automation/scraping, crawler/robots, and data-resale rules.
Every finding must use the exact URL of a cited web-search result. Do not use third-party commentary or search-result claims that you do not cite.`;
    const message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 8192,
      system:
        "You are a conservative policy compliance reviewer. Never treat inference as fact. Return UNKNOWN when authoritative first-party evidence is missing or ambiguous. Output only valid JSON and attach web citations to every search-backed factual finding.",
      tools: directEvidenceSufficient
        ? undefined
        : [
            {
              type: "web_search_20250305",
              name: "web_search",
              max_uses: 1,
              allowed_domains: [officialDomain],
            },
          ],
      messages: [
        {
          role: "user",
          content: `Review policy constraints for this opportunity:
Name: ${opportunity.name}
Platform: ${opportunity.sourcePlatform}
Type: ${opportunity.opportunityType}
Source: ${opportunity.sourceUrl}

Evaluate exactly: Terms of Service, developer/API terms, scraping/automation restrictions, robots/crawler restrictions, data resale restrictions, privacy concerns, and authentication/access restrictions.

Return JSON:
{"status":"GREEN|YELLOW|RED|UNKNOWN","summary":"short review summary","findings":[{"claim":"one directly supported factual finding","source_url":"exact URL from a SOURCE block","source_title":"source title","evaluation_dimension":"one of terms_of_service, developer_api_terms, scraping_automation_restrictions, robots_crawler_restrictions, data_resale_restrictions, privacy_concerns, authentication_access_restrictions"}]}

GREEN means no material restriction was found in the supplied authoritative text; YELLOW means constraints or ambiguity require human review; RED means the intended activity is expressly prohibited or creates a clear policy conflict; UNKNOWN means evidence is insufficient. Do not invent missing permissions. Every finding must be factual, directly supported, and cite an exact supplied URL.

${retrievalInstructions}`,
        },
      ],
    });

    const responseText = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
    if (!responseText) throw new Error("Claude returned no text");
    const validSources = directEvidenceSufficient
      ? directSources(documents)
      : citedWebSources(message, officialDomain);
    let analysis = parseAnalysis(responseText, validSources);
    if (!directEvidenceSufficient && (validSources.size === 0 || analysis.findings.length === 0)) {
      analysis = {
        status: "UNKNOWN",
        summary:
          "The single bounded web search did not return a cited authoritative first-party policy source.",
        findings: [],
      };
    }
    // Replit exposes token and server-tool usage, but not the final passthrough charge.
    // The estimate uses Anthropic's published Sonnet 5 and web-search rates.
    const webSearchUses = message.usage.server_tool_use?.web_search_requests ?? 0;
    const estimatedCost =
      message.usage.input_tokens * SONNET_INPUT_COST_PER_TOKEN +
      message.usage.output_tokens * SONNET_OUTPUT_COST_PER_TOKEN +
      webSearchUses * WEB_SEARCH_COST_PER_USE;
    if (estimatedCost > MAX_ESTIMATED_COST_USD) {
      analysis = {
        status: "UNKNOWN",
        summary:
          "The policy check exceeded the configured $0.50 estimated external-service limit, so no findings were stored.",
        findings: [],
      };
    }
    const observedDate = new Date().toISOString().slice(0, 10);

    const result = await db.transaction(async (tx) => {
      if (analysis.findings.length > 0) {
        await tx.insert(evidenceTable).values(
          analysis.findings.map((finding) => ({
            claim: finding.claim,
            sourceUrl: finding.source_url,
            sourceTitle: finding.source_title,
            observedDate,
            classification: "FACT" as const,
            opportunityId,
            evaluationDimension: finding.evaluation_dimension,
          })),
        );
      }
      await tx
        .update(opportunitiesTable)
        .set({ policyStatus: analysis.status })
        .where(eq(opportunitiesTable.id, opportunityId));

      const [check] = await tx
        .insert(policyChecksTable)
        .values({
          opportunityId,
          status: analysis.status,
          summary: analysis.summary,
          retrievalMethod: directEvidenceSufficient ? "HTTP" : "HTTP_AND_WEB_SEARCH",
          evidenceCreated: analysis.findings.length,
          externalCostUsd: Math.min(estimatedCost, MAX_ESTIMATED_COST_USD),
          aiInputTokens: message.usage.input_tokens,
          aiOutputTokens: message.usage.output_tokens,
        })
        .returning();
      return check;
    });

    res.status(201).json(RunPolicyCheckResponse.parse(toApi(result)));
  } catch (error) {
    req.log.error({ err: error, opportunityId }, "Policy check failed");
    const unknown = await saveUnknown(
      opportunityId,
      "The policy check could not be completed within the bounded retrieval and single-call limits. No automatic paid retry was attempted.",
      "HTTP_INSUFFICIENT",
    );
    await db
      .update(opportunitiesTable)
      .set({ policyStatus: "UNKNOWN" })
      .where(eq(opportunitiesTable.id, opportunityId));
    res.status(201).json(RunPolicyCheckResponse.parse(toApi(unknown)));
  } finally {
    runningChecks.delete(opportunityId);
  }
});

export default router;