import { useLocation } from "wouter"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"

import { useCreateOpportunity, getListOpportunitiesQueryKey, PolicyStatus, Verdict } from "@workspace/api-client-react"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function OpportunityNew() {
  const [, setLocation] = useLocation()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const createMutation = useCreateOpportunity({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListOpportunitiesQueryKey() })
        toast({ title: "Opportunity created", description: "Successfully added new opportunity." })
        setLocation(`/opportunities/${data.id}`)
      },
      onError: (error) => {
        toast({ title: "Error", description: "Failed to create opportunity.", variant: "destructive" })
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

  const onSubmit = (data: OpportunityFormValues) => {
    createMutation.mutate({ data })
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Opportunity</h1>
          <p className="text-muted-foreground mt-1">Record a new opportunity to research.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Fill in the foundational information for this opportunity.</CardDescription>
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
                        <Input placeholder="e.g. Acme Yield Farming" {...field} />
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
                        <Input placeholder="e.g. Twitter, Telegram" {...field} />
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
                      <Input type="url" placeholder="https://..." {...field} />
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
                        <Input placeholder="e.g. DeFi, Arbitrage" {...field} />
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
                        <Input placeholder="e.g. EVM, Solana" {...field} />
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
                      <Textarea 
                        placeholder="Describe why this is an opportunity..." 
                        className="h-24 resize-none"
                        {...field} 
                      />
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

              <div className="flex justify-end gap-3 pt-6">
                <Link href="/" className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                  Cancel
                </Link>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Opportunity"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
