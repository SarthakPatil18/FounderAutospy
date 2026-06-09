import { Link } from "wouter";
import type { Startup } from "@workspace/api-client-react";

export function StartupCard({ startup }: { startup: Startup }) {
  return (
    <Link href={`/startups/${startup.id}`}>
      <div className="bg-white rounded-lg p-6 flex flex-col h-full hover:scale-[1.01] transition-transform duration-200 cursor-pointer shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-float)] border border-transparent">
        <div className="flex items-center justify-between mb-4">
          <div className="px-3 py-1 bg-[#fafafa] border border-[#ebebeb] rounded-full">
            <span className="font-mono text-xs text-[#888888] uppercase tracking-wider">{startup.industry}</span>
          </div>
          <span className="font-mono text-xs text-[#888888]">
            {startup.foundedYear}–{startup.closedYear}
          </span>
        </div>
        
        <h3 className="font-sans font-semibold text-xl text-[#171717] mb-2 line-clamp-1">
          {startup.name}
        </h3>
        
        <p className="font-sans text-base text-[#4d4d4d] mb-6 flex-grow line-clamp-2 leading-snug">
          {startup.tagline}
        </p>
        
        <div className="mt-auto flex flex-wrap gap-2">
          {startup.aiTags?.map((tag) => {
            let bgColor = "bg-[#f5f5f5]";
            let textColor = "text-[#4d4d4d]";
            
            const lowerTag = tag.toLowerCase();
            if (lowerTag.includes("pmf") || lowerTag.includes("product market fit")) {
              bgColor = "bg-[#e6fbf7]";
              textColor = "text-[#0d9488]";
            } else if (lowerTag.includes("cash") || lowerTag.includes("funding")) {
              bgColor = "bg-[#fef9c3]";
              textColor = "text-[#ca8a04]";
            } else if (lowerTag.includes("team") || lowerTag.includes("conflict")) {
              bgColor = "bg-[#fee2e2]";
              textColor = "text-[#dc2626]";
            }

            return (
              <span 
                key={tag} 
                className={`font-mono text-[11px] px-2 py-0.5 rounded-sm ${bgColor} ${textColor}`}
              >
                {tag}
              </span>
            );
          })}
        </div>
      </div>
    </Link>
  );
}
