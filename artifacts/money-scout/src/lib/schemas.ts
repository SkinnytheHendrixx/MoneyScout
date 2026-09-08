import { z } from "zod"
import { PolicyStatus, Verdict } from "@workspace/api-client-react"

export const opportunitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  source_platform: z.string().min(1, "Source platform is required"),
  source_url: z.string().url("Must be a valid URL").or(z.literal("")),
  opportunity_type: z.string().min(1, "Type is required"),
  thesis: z.string().min(1, "Thesis is required"),
  status: z.string().min(1, "Status is required"),
  overall_score: z.coerce.number().min(0).max(100),
  policy_status: z.enum([PolicyStatus.GREEN, PolicyStatus.YELLOW, PolicyStatus.RED, PolicyStatus.UNKNOWN]),
  verdict: z.enum([Verdict.NEW, Verdict.RESEARCH, Verdict.WATCH, Verdict.TEST, Verdict.BUILD, Verdict.KILL]),
  kill_reason: z.string().nullable().optional(),
  engine_family: z.string().min(1, "Engine family is required"),
  first_seen: z.string(),
  last_researched: z.string(),
})

export type OpportunityFormValues = z.infer<typeof opportunitySchema>
