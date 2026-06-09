import { Link } from "wouter";
import { Show } from "@clerk/react";

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 w-full h-[64px] bg-white border-b border-[#ebebeb] flex items-center px-6 justify-between">
      <div className="flex-1 flex items-center">
        <Link href="/" className="font-sans font-semibold text-[#171717] text-lg hover:opacity-80 transition-opacity">
          FounderAutopsy
        </Link>
      </div>
      
      <div className="flex-1 flex justify-center items-center gap-6">
        <Link href="/explore" className="font-sans text-sm text-[#4d4d4d] hover:text-[#171717] transition-colors">
          Explore
        </Link>
        <Link href="/insights" className="font-sans text-sm text-[#4d4d4d] hover:text-[#171717] transition-colors">
          Insights
        </Link>
        <Link href="/submit" className="font-sans text-sm text-[#4d4d4d] hover:text-[#171717] transition-colors">
          Submit Your Story
        </Link>
      </div>

      <div className="flex-1 flex justify-end items-center gap-3">
        <Show when="signed-out">
          <Link href="/sign-in" className="flex items-center justify-center h-7 px-3 bg-white text-[#171717] border border-[#ebebeb] rounded-md font-sans text-sm hover:bg-[#f5f5f5] transition-colors">
            Log In
          </Link>
        </Show>
        <Link href="/sign-in" className="flex items-center justify-center h-7 px-3 bg-[#171717] text-white rounded-md font-sans text-sm hover:bg-[#333333] transition-colors shadow-sm">
          Submit Story
        </Link>
      </div>
    </nav>
  );
}
