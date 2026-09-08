import { z } from "zod"
import { EvidenceClassification } from "@workspace/api-client-react"

export const evidenceSchema = z.object({
  claim: z.string().min(1, "Claim is required"),
  source_url: z.string().url("Must be a valid URL").or(z.literal("")),
  source_title: z.string().min(1, "Source title is required"),
  observed_date: z.string().min(1, "Date is required"),
  classification: z.enum([EvidenceClassification.FACT, EvidenceClassification.CLAIM, EvidenceClassification.INFERENCE, EvidenceClassification.UNKNOWN]),
  evaluation_dimension: z.string().min(1, "Dimension is required"),
})

export type EvidenceFormValues = z.infer<typeof evidenceSchema>
