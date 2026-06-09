import { Link } from "wouter";
import { useListStartups, useGetInsightsSummary } from "@workspace/api-client-react";
import { StartupCard } from "@/components/startup-card";
import { formatNumber } from "@/lib/format";

export default function Home() {
  const { data: startupsData, isLoading: isLoadingStartups } = useListStartups({ limit: 3 });
  const { data: stats, isLoading: isLoadingStats } = useGetInsightsSummary();

  return (
    <main className="w-full font-sans">
      {/* Hero Band */}
      <section className="relative w-full bg-white px-6 py-24 overflow-hidden">
        {/* Mesh gradient backdrop */}
        <div 
          className="absolute top-0 left-[-20%] w-[140%] h-[500px] opacity-[0.16] pointer-events-none animate-mesh"
          style={{ background: 'linear-gradient(135deg, #007cf0, #00dfd8, #7928ca, #ff0080, #ff4d4d, #f9cb28)', filter: 'blur(80px)' }}
        />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center justify-center px-3 py-1 mb-8 bg-[#fafafa] rounded-full">
            <span className="font-mono text-xs text-[#171717]">/ startup failure knowledge base</span>
          </div>
          
          <h1 className="font-semibold text-5xl md:text-6xl text-[#171717] tracking-[-2.4px] leading-tight mb-6">
            What killed the company. Precisely.
          </h1>
          
          <p className="text-lg md:text-xl text-[#4d4d4d] max-w-2xl mx-auto mb-10 leading-relaxed">
            FounderAutospy is the first open platform where founders document their own shutdowns — and AI performs the autopsy.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link href="/sign-in" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-[#171717] text-white rounded-full font-sans font-medium hover:bg-[#333] transition-colors shadow-sm">
              Submit Your Postmortem
            </Link>
            <Link href="/explore" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-white text-[#171717] border border-[#ebebeb] rounded-full font-sans font-medium hover:bg-[#fafafa] transition-colors">
              Explore Autopsies
            </Link>
          </div>
          
          <p className="font-mono text-[13px] text-[#888888]">
            Free forever. No paywall. Community-built.
          </p>
        </div>
      </section>

      {/* 4-up USP strip */}
      <section className="w-full bg-[#fafafa] px-6 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-[var(--shadow-card)]">
            <h3 className="font-sans font-semibold text-xl text-[#171717] mb-3">Founder-written</h3>
            <p className="font-sans text-[#4d4d4d] leading-relaxed">Every entry by the actual founder. Primary source, not journalism.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-[var(--shadow-card)]">
            <h3 className="font-sans font-semibold text-xl text-[#171717] mb-3">AI autopsy engine</h3>
            <p className="font-sans text-[#4d4d4d] leading-relaxed">Gemini analyzes root cause, contributing factors, and failure tags.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-[var(--shadow-card)]">
            <h3 className="font-sans font-semibold text-xl text-[#171717] mb-3">Similar failure matching</h3>
            <p className="font-sans text-[#4d4d4d] leading-relaxed">See every startup that died the same way yours did.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-[var(--shadow-card)]">
            <h3 className="font-sans font-semibold text-xl text-[#171717] mb-3">Free and open</h3>
            <p className="font-sans text-[#4d4d4d] leading-relaxed">No paywall. No gatekeeping. Built by the founder community.</p>
          </div>
        </div>
      </section>

      {/* Dark band - Code editor mockup */}
      <section className="w-full bg-[#171717] px-6 py-24">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-left">
            <h2 className="font-sans font-semibold text-3xl md:text-4xl text-white tracking-[-1.28px] mb-4">
              The autopsy report every founder needs to read.
            </h2>
            <p className="font-sans text-lg text-[#888888] leading-relaxed">
              AI reads the full postmortem and returns a structured diagnosis.
            </p>
          </div>
          
          <div className="flex-1 w-full max-w-xl">
            <div className="bg-[#1e1e1e] rounded-lg p-6 shadow-2xl border border-white/10">
              <pre className="font-mono text-[13px] leading-relaxed overflow-x-auto text-[#d4d4d4]">
{`{
  "`}<span className="text-[#50e3c2]">primary_cause</span>{`": "`}<span className="text-[#f9cb28]">PMF mismatch — built for market that didn't exist yet</span>{`",
  "`}<span className="text-[#50e3c2]">contributing_factors</span>{`": [
    "`}<span className="text-[#f9cb28]">Raised too early before validating demand</span>{`",
    "`}<span className="text-[#f9cb28]">Hired ahead of revenue</span>{`",
    "`}<span className="text-[#f9cb28]">Pivoted 3 times in 18 months</span>{`"
  ],
  "`}<span className="text-[#50e3c2]">tags</span>{`": ["`}<span className="text-[#f9cb28]">PMF mismatch</span>{`", "`}<span className="text-[#f9cb28]">Cash flow</span>{`", "`}<span className="text-[#f9cb28]">Pivot failure</span>{`"],
  "`}<span className="text-[#50e3c2]">verdict</span>{`": "`}<span className="text-[#f9cb28]">Classic premature scaling. Product had signal but market needed 3 more years.</span>{`"
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Recent postmortems */}
      <section className="w-full bg-[#fafafa] px-6 py-24 border-y border-[#ebebeb]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="font-mono text-xs text-[#888888] mb-4 block">/ recent autopsies</span>
            <div className="flex items-end justify-between">
              <h2 className="font-sans font-semibold text-3xl md:text-4xl text-[#171717] tracking-[-1.28px]">
                Latest from the community.
              </h2>
              <Link href="/explore" className="font-sans text-sm text-[#0070f3] hover:underline">
                View all →
              </Link>
            </div>
          </div>

          {isLoadingStartups ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg p-6 h-64 border border-[#ebebeb] flex flex-col">
                  <div className="w-full h-8 bg-[#f5f5f5] rounded animate-pulse mb-4" />
                  <div className="w-3/4 h-6 bg-[#f5f5f5] rounded animate-pulse mb-6" />
                  <div className="w-full h-20 bg-[#f5f5f5] rounded animate-pulse mt-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {startupsData?.startups.map(startup => (
                <StartupCard key={startup.id} startup={startup} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats band */}
      <section className="w-full bg-white px-6 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="font-sans font-semibold text-5xl text-[#171717] mb-2">
              {isLoadingStats ? "—" : formatNumber(stats?.totalPostmortems)}
            </div>
            <div className="font-mono text-xs text-[#888888] uppercase tracking-wider">
              Total Postmortems
            </div>
          </div>
          <div className="md:border-x border-[#ebebeb] px-4">
            <div className="font-sans font-semibold text-5xl text-[#171717] mb-2">
              {isLoadingStats ? "—" : formatNumber(stats?.totalIndustries)}
            </div>
            <div className="font-mono text-xs text-[#888888] uppercase tracking-wider">
              Industries Covered
            </div>
          </div>
          <div>
            <div className="font-sans font-semibold text-3xl md:text-4xl text-[#171717] mb-2 h-12 flex items-center justify-center">
              {isLoadingStats ? "—" : stats?.topFailureCause || "—"}
            </div>
            <div className="font-mono text-xs text-[#888888] uppercase tracking-wider">
              Top Failure Cause
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
