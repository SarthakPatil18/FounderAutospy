import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Show } from "@clerk/react";
import { useCreateStartup } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  tagline: z.string().min(1, "Tagline is required"),
  industry: z.string().min(1, "Industry is required"),
  foundedYear: z.coerce.number().min(1900).max(new Date().getFullYear()),
  closedYear: z.coerce.number().min(1900).max(new Date().getFullYear()),
  story: z.string().min(50, "Please provide more detail about your story"),
  whatFailed: z.string().min(20, "Please describe what failed"),
  lessonsLearned: z.string().min(20, "Please share some lessons learned"),
  peakMrr: z.coerce.number().nullable().optional(),
  teamSize: z.coerce.number().nullable().optional(),
  totalRaised: z.coerce.number().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

const INDUSTRIES = ["SaaS", "Consumer", "Fintech", "Healthtech", "Hardware", "Web3", "Marketplace", "E-commerce", "Other"];

export default function Submit() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const mutation = useCreateStartup();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      tagline: "",
      industry: "SaaS",
      foundedYear: new Date().getFullYear() - 2,
      closedYear: new Date().getFullYear(),
      story: "",
      whatFailed: "",
      lessonsLearned: "",
      peakMrr: null,
      teamSize: null,
      totalRaised: null,
    }
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate({ data }, {
      onSuccess: (startup) => {
        setLocation(`/startups/${startup.id}`);
      }
    });
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ["name", "tagline", "industry", "foundedYear", "closedYear"];
    if (step === 2) fieldsToValidate = ["story"];
    if (step === 3) fieldsToValidate = ["whatFailed"];
    // step 4 is optional
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(s => Math.min(s + 1, 5));
    }
  };

  const prevStep = () => {
    setStep(s => Math.max(s - 1, 1));
  };

  return (
    <main className="min-h-screen bg-[#fafafa] font-sans flex items-center justify-center p-6">
      <Show when="signed-out">
        <div className="bg-white p-12 rounded-xl shadow-[var(--shadow-card)] text-center max-w-md w-full border border-[#ebebeb]">
          <h2 className="font-semibold text-2xl text-[#171717] mb-4">Sign in to share your startup's story</h2>
          <p className="text-[#4d4d4d] mb-8">We require founders to be authenticated to ensure high-quality, verified postmortems.</p>
          <Link href="/sign-in" className="inline-flex items-center justify-center px-6 py-3 bg-[#171717] text-white rounded-full font-sans font-medium hover:bg-[#333] transition-colors w-full">
            Log In to Submit
          </Link>
        </div>
      </Show>

      <Show when="signed-in">
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-[var(--shadow-float)] max-w-2xl w-full border border-[#ebebeb] my-12">
          <div className="mb-8">
            <span className="font-mono text-sm text-[#888888]">0{step} / 05</span>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h2 className="font-semibold text-2xl text-[#171717]">The Basics</h2>
                  
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#171717] font-medium">Startup Name</FormLabel>
                      <FormControl><Input {...field} className="border-[#ebebeb] focus-visible:ring-[#171717]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="tagline" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#171717] font-medium">Tagline (One sentence)</FormLabel>
                      <FormControl><Input {...field} className="border-[#ebebeb] focus-visible:ring-[#171717]" placeholder="e.g. Uber for dogs" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="industry" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#171717] font-medium">Industry</FormLabel>
                      <FormControl>
                        <select {...field} className="flex h-10 w-full rounded-md border border-[#ebebeb] bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]">
                          {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="foundedYear" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#171717] font-medium">Founded Year</FormLabel>
                        <FormControl><Input type="number" {...field} className="border-[#ebebeb] focus-visible:ring-[#171717]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="closedYear" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#171717] font-medium">Closed Year</FormLabel>
                        <FormControl><Input type="number" {...field} className="border-[#ebebeb] focus-visible:ring-[#171717]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h2 className="font-semibold text-2xl text-[#171717]">The Story</h2>
                  <p className="text-[#4d4d4d]">Tell us what you built and who you built it for. Provide context before diving into the failure.</p>
                  
                  <FormField control={form.control} name="story" render={({ field }) => (
                    <FormItem>
                      <FormControl><Textarea {...field} className="min-h-[240px] resize-y border-[#ebebeb] focus-visible:ring-[#171717] p-4 text-base" placeholder="We started out building..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h2 className="font-semibold text-2xl text-[#171717]">What Failed</h2>
                  <p className="text-[#4d4d4d]">Be brutally honest. What were the root causes? This is what our AI will analyze.</p>
                  
                  <FormField control={form.control} name="whatFailed" render={({ field }) => (
                    <FormItem>
                      <FormControl><Textarea {...field} className="min-h-[240px] resize-y border-[#ebebeb] focus-visible:ring-[#171717] p-4 text-base" placeholder="Ultimately, we ran out of money because we hired too fast before achieving true product-market fit..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h2 className="font-semibold text-2xl text-[#171717]">Optional Metrics</h2>
                  <p className="text-[#4d4d4d]">Data adds credibility to your autopsy, but feel free to skip if you prefer not to share.</p>
                  
                  <FormField control={form.control} name="peakMrr" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#171717] font-medium">Peak MRR (USD)</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value || ""} className="border-[#ebebeb] focus-visible:ring-[#171717]" placeholder="e.g. 50000" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="teamSize" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#171717] font-medium">Peak Team Size</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value || ""} className="border-[#ebebeb] focus-visible:ring-[#171717]" placeholder="e.g. 12" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="totalRaised" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#171717] font-medium">Total Raised (USD)</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value || ""} className="border-[#ebebeb] focus-visible:ring-[#171717]" placeholder="e.g. 1500000" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h2 className="font-semibold text-2xl text-[#171717]">Lessons Learned</h2>
                  <p className="text-[#4d4d4d]">Key takeaways for the next founder. What would you do differently?</p>
                  
                  <FormField control={form.control} name="lessonsLearned" render={({ field }) => (
                    <FormItem>
                      <FormControl><Textarea {...field} className="min-h-[240px] resize-y border-[#ebebeb] focus-visible:ring-[#171717] p-4 text-base" placeholder="1. Validate demand before building..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}

              <div className="flex items-center justify-between pt-8 border-t border-[#ebebeb]">
                {step > 1 ? (
                  <button type="button" onClick={prevStep} className="px-6 py-2.5 bg-white text-[#171717] border border-[#ebebeb] rounded-full font-medium hover:bg-[#fafafa] transition-colors">
                    Back
                  </button>
                ) : <div />}
                
                {step < 5 ? (
                  <button type="button" onClick={nextStep} className="px-6 py-2.5 bg-[#171717] text-white rounded-full font-medium hover:bg-[#333] transition-colors shadow-sm ml-auto">
                    Next Step
                  </button>
                ) : (
                  <button type="submit" disabled={mutation.isPending} className="px-8 py-2.5 bg-[#171717] text-white rounded-full font-medium hover:bg-[#333] transition-colors shadow-sm ml-auto flex items-center gap-2">
                    {mutation.isPending ? "Submitting..." : "Submit Postmortem"}
                  </button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </Show>
    </main>
  );
}
