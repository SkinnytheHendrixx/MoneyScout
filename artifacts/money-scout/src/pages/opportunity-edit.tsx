import { useLocation, useParams } from "wouter"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"

import { useGetOpportunity, useUpdateOpportunity, getGetOpportunityQueryKey, getListOpportunitiesQueryKey, PolicyStatus, Verdict } from "@workspace/api-client-react"
import { opportunitySchema, type OpportunityFormValues } from "@/lib/schemas"
import { useToast } from "@/components/ui/use-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Link } from "wouter"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function OpportunityEdit() {
  const params = useParams()
  const id = Number(params.id)
  const [, setLocation] = useLocation()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const { data: opportunity, isLoading } = useGetOpportunity(id)

  const updateMutation = useUpdateOpportunity({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetOpportunityQueryKey(id), data)
        queryClient.invalidateQueries({ queryKey: getListOpportunitiesQueryKey() })
        toast({ title: "Opportunity updated", description: "Successfully saved changes." })
        setLocation(`/opportunities/${data.id}`)
      },
      onError: (error) => {
        toast({ title: "Error", description: "Failed to update opportunity.", variant: "destructive" })
        console.error(error)
      }
    }
  })

  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      name: "",
      source_platform: "",
      source_url: "",
      opportunity_type: "",
      thesis: "",
      status: "Active",
      overall_score: 0,
      policy_status: PolicyStatus.UNKNOWN,
      verdict: Verdict.NEW,
      kill_reason: "",
      engine_family: "",
      first_seen: new Date().toISOString(),
      last_researched: new Date().toISOString(),
    }
  })

  const initialized = useRef(false)
  useEffect(() => {
    if (opportunity && !initialized.current) {
      form.reset({
        name: opportunity.name,
        source_platform: opportunity.source_platform,
        source_url: opportunity.source_url || "",
        opportunity_type: opportunity.opportunity_type,
        thesis: opportunity.thesis,
        status: opportunity.status,
        overall_score: opportunity.overall_score,
        policy_status: opportunity.policy_status as PolicyStatus,
        verdict: opportunity.verdict as Verdict,
        kill_reason: opportunity.kill_reason || "",
        engine_family: opportunity.engine_family,
        first_seen: opportunity.first_seen,
        last_researched: opportunity.last_researched,
      })
      initialized.current = true
    }
  }, [opportunity, form])

  const onSubmit = (data: OpportunityFormValues) => {
    updateMutation.mutate({ id, data })
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading...</div>
  }

  if (!opportunity) {
    return <div className="p-8 text-center text-destructive">Opportunity not found.</div>
  }

  const watchVerdict = form.watch("verdict")

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/opportunities/${id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Opportunity</h1>
          <p className="text-muted-foreground mt-1">Update details for {opportunity.name}.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Modify the foundational information for this opportunity.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="source_platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Platform</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="source_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source URL</FormLabel>
                    <FormControl>
                      <Input type="url" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="opportunity_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opportunity Type</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="engine_family"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Engine Family</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="thesis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Thesis</FormLabel>
                    <FormControl>
                      <Textarea className="h-24 resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                <FormField
                  control={form.control}
                  name="verdict"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verdict</FormLabel>
                      <FormControl>
                        <Select value={field.value} onChange={field.onChange} onBlur={field.onBlur}>
                          {Object.values(Verdict).map(v => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="policy_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policy Status</FormLabel>
                      <FormControl>
                        <Select value={field.value} onChange={field.onChange} onBlur={field.onBlur}>
                          {Object.values(PolicyStatus).map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="overall_score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overall Score</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Active, Archived" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {watchVerdict === "KILL" && (
                <FormField
                  control={form.control}
                  name="kill_reason"
                  render={({ field }) => (
                    <FormItem className="animate-in fade-in slide-in-from-top-2">
                      <FormLabel className="text-destructive">Kill Reason</FormLabel>
                      <FormControl>
                        <Textarea 
                          className="border-destructive/50 focus-visible:ring-destructive/50" 
                          placeholder="Why was this opportunity killed?" 
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end gap-3 pt-6">
                <Link href={`/opportunities/${id}`} className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                  Cancel
                </Link>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
