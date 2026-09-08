import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"

import { 
  useCreateEvidence, 
  useUpdateEvidence, 
  useGetEvidence,
  getListEvidenceQueryKey,
  EvidenceClassification
} from "@workspace/api-client-react"
import { evidenceSchema, type EvidenceFormValues } from "@/lib/evidence-schema"
import { useToast } from "@/components/ui/use-toast"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

interface EvidenceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunityId: number
  evidenceId: number | null
}

export function EvidenceDialog({ open, onOpenChange, opportunityId, evidenceId }: EvidenceDialogProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const isEditing = !!evidenceId

  const { data: existingEvidence, isLoading: isLoadingEvidence } = useGetEvidence(
    evidenceId as number, 
    { query: { enabled: isEditing && open, queryKey: ["evidence", evidenceId] } }
  )

  const createMutation = useCreateEvidence({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEvidenceQueryKey(opportunityId) })
        toast({ title: "Evidence added" })
        onOpenChange(false)
        form.reset()
      },
      onError: (err) => {
        toast({ title: "Failed to add evidence", variant: "destructive" })
        console.error(err)
      }
    }
  })

  const updateMutation = useUpdateEvidence({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEvidenceQueryKey(opportunityId) })
        toast({ title: "Evidence updated" })
        onOpenChange(false)
      },
      onError: (err) => {
        toast({ title: "Failed to update evidence", variant: "destructive" })
        console.error(err)
      }
    }
  })

  const form = useForm<EvidenceFormValues>({
    resolver: zodResolver(evidenceSchema),
    defaultValues: {
      claim: "",
      source_url: "",
      source_title: "",
      observed_date: new Date().toISOString(),
      classification: EvidenceClassification.FACT,
      evaluation_dimension: "",
    }
  })

  useEffect(() => {
    if (open) {
      if (isEditing && existingEvidence) {
        form.reset({
          claim: existingEvidence.claim,
          source_url: existingEvidence.source_url || "",
          source_title: existingEvidence.source_title,
          observed_date: existingEvidence.observed_date,
          classification: existingEvidence.classification as EvidenceClassification,
          evaluation_dimension: existingEvidence.evaluation_dimension,
        })
      } else if (!isEditing) {
        form.reset({
          claim: "",
          source_url: "",
          source_title: "",
          observed_date: new Date().toISOString(),
          classification: EvidenceClassification.FACT,
          evaluation_dimension: "",
        })
      }
    }
  }, [open, isEditing, existingEvidence, form])

  const onSubmit = (data: EvidenceFormValues) => {
    if (isEditing) {
      updateMutation.mutate({ 
        id: evidenceId as number, 
        data: { ...data, opportunity_id: opportunityId } 
      })
    } else {
      createMutation.mutate({ 
        opportunityId, 
        data 
      })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Evidence" : "Add Evidence"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update existing evidence record." : "Log a new piece of evidence for this opportunity."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingEvidence ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              
              <FormField
                control={form.control}
                name="claim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Claim / Fact</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="State the core claim..." 
                        className="resize-none h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="classification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classification</FormLabel>
                      <FormControl>
                        <Select value={field.value} onChange={field.onChange} onBlur={field.onBlur}>
                          {Object.values(EvidenceClassification).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="evaluation_dimension"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dimension (e.g. Risk, TVL, Yield)</FormLabel>
                      <FormControl>
                        <Input placeholder="Risk, Security, Yield..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="source_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Audit Report v2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source URL</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="observed_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observed Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" 
                        value={field.value ? field.value.slice(0, 16) : ""}
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          if (!isNaN(date.getTime())) {
                            field.onChange(date.toISOString());
                          } else {
                            field.onChange(e.target.value);
                          }
                        }}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : isEditing ? "Save Changes" : "Add Evidence"}
                </Button>
              </div>

            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
