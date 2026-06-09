import { useState } from "react";
import { useListStartups, getListStartupsQueryKey } from "@workspace/api-client-react";
import { StartupCard } from "@/components/startup-card";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const INDUSTRIES = ["All", "SaaS", "Consumer", "Fintech", "Healthtech", "Hardware", "Web3"];
const FAILURE_TYPES = ["All", "PMF mismatch", "Cash flow", "Team conflict", "Competition", "Regulatory"];

export default function Explore() {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [failureType, setFailureType] = useState("All");
  const [year, setYear] = useState<string>("All");
  
  const queryParams = {
    ...(search ? { search } : {}),
    ...(industry !== "All" ? { industry } : {}),
    ...(failureType !== "All" ? { failureCause: failureType } : {}),
    ...(year !== "All" ? { year: parseInt(year, 10) } : {}),
  };

  const { data, isLoading } = useListStartups(queryParams);

  return (
    <main className="w-full min-h-screen bg-[#fafafa] font-sans pt-12 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-12">
          <h1 className="font-semibold text-3xl md:text-4xl text-[#171717] tracking-[-1.28px] mb-3">
            Explore every autopsy.
          </h1>
          <p className="text-lg text-[#4d4d4d]">
            Filter by industry, failure type, or year.
          </p>
        </header>

        <div className="mb-10 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
            <Input 
              type="search" 
              placeholder="Search by startup name or keywords..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 h-10 border-[#ebebeb] rounded-md focus-visible:ring-[#171717] bg-white shadow-sm"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="space-y-2">
              <label className="font-mono text-[11px] text-[#888888] uppercase tracking-wider">Industry</label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map(i => (
                  <button
                    key={i}
                    onClick={() => setIndustry(i)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${industry === i ? 'bg-[#171717] text-white' : 'bg-white border border-[#ebebeb] text-[#4d4d4d] hover:bg-[#f5f5f5]'}`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="font-mono text-[11px] text-[#888888] uppercase tracking-wider">Failure Type</label>
              <div className="flex flex-wrap gap-2">
                {FAILURE_TYPES.map(f => (
                  <button
                    key={f}
                    onClick={() => setFailureType(f)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${failureType === f ? 'bg-[#171717] text-white' : 'bg-white border border-[#ebebeb] text-[#4d4d4d] hover:bg-[#f5f5f5]'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg p-6 h-64 border border-[#ebebeb] flex flex-col">
                <div className="w-full h-8 bg-[#f5f5f5] rounded animate-pulse mb-4" />
                <div className="w-3/4 h-6 bg-[#f5f5f5] rounded animate-pulse mb-6" />
                <div className="w-full h-20 bg-[#f5f5f5] rounded animate-pulse mt-auto" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {data?.startups.length === 0 ? (
              <div className="text-center py-24 bg-white border border-[#ebebeb] rounded-lg">
                <p className="font-sans text-[#4d4d4d]">No autopsies found matching your filters.</p>
                <button onClick={() => { setSearch(""); setIndustry("All"); setFailureType("All"); setYear("All"); }} className="mt-4 text-[#0070f3] hover:underline text-sm font-medium">Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.startups.map(startup => (
                  <StartupCard key={startup.id} startup={startup} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
