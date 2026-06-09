import { useParams } from "wouter";
import { useGetStartup, useGetSimilarStartups, getGetStartupQueryKey } from "@workspace/api-client-react";
import { formatCurrency, formatNumber } from "@/lib/format";
import { StartupCard } from "@/components/startup-card";

export default function StartupDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0", 10);

  const { data: startup, isLoading, isError } = useGetStartup(id, {
    query: { enabled: !!id, queryKey: getGetStartupQueryKey(id) }
  });

  const { data: similar } = useGetSimilarStartups(id, {
    query: { enabled: !!id }
  });

  if (isLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center font-mono text-[#888]">Loading autopsy...</div>;
  }

  if (isError || !startup) {
    return <div className="min-h-screen bg-white flex items-center justify-center font-mono text-[#dc2626]">Failed to load autopsy or not found.</div>;
  }

  return (
    <main className="w-full font-sans pb-24">
      {/* Header Band */}
      <header className="w-full bg-white px-6 py-16 border-b border-[#ebebeb]">
        <div className="max-w-4xl mx-auto">
          <span className="font-mono text-xs text-[#888888] mb-4 block">/ postmortem</span>
          <h1 className="font-semibold text-5xl md:text-6xl text-[#171717] tracking-[-2.4px] leading-tight mb-6">
            {startup.name}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <div className="px-3 py-1 bg-[#fafafa] border border-[#ebebeb] rounded-full">
              <span className="font-mono text-xs text-[#171717] uppercase tracking-wider">{startup.industry}</span>
            </div>
            <span className="font-mono text-sm text-[#4d4d4d]">{startup.foundedYear}–{startup.closedYear}</span>
            <span className="text-[#ebebeb] hidden sm:inline">|</span>
            <span className="font-sans text-sm font-medium text-[#4d4d4d]">Submitted by founder</span>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#ebebeb]">
            <div>
              <div className="font-mono text-xs text-[#888888] uppercase tracking-wider mb-2">Peak MRR</div>
              <div className="font-sans font-semibold text-2xl text-[#171717]">{formatCurrency(startup.peakMrr)}</div>
            </div>
            <div>
              <div className="font-mono text-xs text-[#888888] uppercase tracking-wider mb-2">Team Size</div>
              <div className="font-sans font-semibold text-2xl text-[#171717]">{formatNumber(startup.teamSize)}</div>
            </div>
            <div>
              <div className="font-mono text-xs text-[#888888] uppercase tracking-wider mb-2">Total Raised</div>
              <div className="font-sans font-semibold text-2xl text-[#171717]">{formatCurrency(startup.totalRaised)}</div>
            </div>
          </div>
        </div>
      </header>

      {/* The Story */}
      <section className="w-full bg-white px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <span className="font-mono text-xs text-[#888888] mb-6 block text-center">/ the story</span>
          <div className="max-w-[720px] mx-auto prose prose-p:text-[#4d4d4d] prose-p:text-lg prose-p:leading-[1.7] prose-p:mb-6 whitespace-pre-wrap">
            {startup.story}
          </div>
        </div>
      </section>

      {/* What Failed */}
      <section className="w-full bg-[#fafafa] px-6 py-20 border-y border-[#ebebeb]">
        <div className="max-w-4xl mx-auto">
          <span className="font-mono text-xs text-[#888888] mb-6 block">/ what went wrong</span>
          <div className="bg-white p-8 rounded-lg shadow-[var(--shadow-card)] border-l-4 border-l-[#171717]">
            <p className="font-sans text-[#171717] text-lg leading-relaxed whitespace-pre-wrap">
              {startup.whatFailed}
            </p>
          </div>
        </div>
      </section>

      {/* AI Autopsy */}
      <section className="w-full bg-[#171717] px-6 py-24 text-white">
        <div className="max-w-4xl mx-auto">
          <span className="font-mono text-xs text-[#50e3c2] mb-4 block">/ autopsy report</span>
          <h2 className="font-semibold text-3xl text-white tracking-[-1.28px] mb-8">
            AI diagnosis.
          </h2>

          <div className="bg-[#1a1a1a] rounded-xl p-8 shadow-2xl border border-white/5">
            {!startup.aiRootCause ? (
              <div className="py-12 text-center font-mono text-[#888888]">
                Autopsy pending...
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <h3 className="font-mono text-xs text-[#888888] uppercase tracking-wider mb-2">Primary Cause</h3>
                  <div className="font-sans font-semibold text-2xl text-white">{startup.aiRootCause}</div>
                </div>

                {startup.aiFactors && startup.aiFactors.length > 0 && (
                  <div>
                    <h3 className="font-mono text-xs text-[#888888] uppercase tracking-wider mb-3">Contributing Factors</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {startup.aiFactors.map((factor, i) => (
                        <li key={i} className="text-[#aaa] text-base">{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {startup.aiTags && startup.aiTags.length > 0 && (
                  <div>
                    <h3 className="font-mono text-xs text-[#888888] uppercase tracking-wider mb-3">Failure Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {startup.aiTags.map(tag => {
                        let bgColor = "bg-white/10";
                        let textColor = "text-[#d4d4d4]";
                        const lowerTag = tag.toLowerCase();
                        
                        if (lowerTag.includes("pmf") || lowerTag.includes("product market fit")) {
                          bgColor = "bg-[#003d33]";
                          textColor = "text-[#50e3c2]";
                        } else if (lowerTag.includes("cash") || lowerTag.includes("funding")) {
                          bgColor = "bg-[#423101]";
                          textColor = "text-[#f9cb28]";
                        } else if (lowerTag.includes("team") || lowerTag.includes("conflict")) {
                          bgColor = "bg-[#450a0a]";
                          textColor = "text-[#fca5a5]";
                        }
            
                        return (
                          <span key={tag} className={`font-mono text-[11px] px-3 py-1 rounded-sm ${bgColor} ${textColor}`}>
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {startup.aiVerdict && (
                  <div className="pt-6 border-t border-white/10">
                    <h3 className="font-mono text-xs text-[#888888] uppercase tracking-wider mb-2">Verdict</h3>
                    <p className="font-sans text-[#888888] italic text-base leading-relaxed">
                      {startup.aiVerdict}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-8 text-right">
              <span className="font-mono text-[11px] text-[#555]">AI-generated analysis. May contain errors.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Lessons Learned */}
      <section className="w-full bg-[#fafafa] px-6 py-20 border-b border-[#ebebeb]">
        <div className="max-w-4xl mx-auto">
          <span className="font-mono text-xs text-[#888888] mb-6 block">/ lessons learned</span>
          <div className="bg-white p-8 rounded-lg shadow-[var(--shadow-card)]">
            <div className="prose prose-p:text-[#4d4d4d] prose-p:text-lg prose-p:leading-relaxed whitespace-pre-wrap">
              {startup.lessonsLearned}
            </div>
          </div>
        </div>
      </section>

      {/* Similar Failures */}
      {similar && similar.startups.length > 0 && (
        <section className="w-full bg-white px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <span className="font-mono text-xs text-[#888888] mb-4 block text-center">/ died the same way</span>
            <h2 className="font-semibold text-3xl text-[#171717] tracking-[-1.28px] mb-10 text-center">
              Startups that failed for similar reasons.
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similar.startups.slice(0, 3).map(s => (
                <StartupCard key={s.id} startup={s} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
