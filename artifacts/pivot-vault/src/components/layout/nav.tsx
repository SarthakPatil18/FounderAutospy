import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Show, useAuth } from "@/hooks/use-auth";
import { Menu, X } from "lucide-react";

export function Nav() {
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-[#ebebeb]">
      <div className="h-[64px] flex items-center px-4 md:px-6 justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex-1 flex items-center">
          <Link href="/" onClick={closeMenu} className="font-sans font-semibold text-[#171717] text-lg hover:opacity-80 transition-opacity">
            FounderAutospy
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 justify-center items-center gap-6">
          <Link href="/explore" className={`font-sans text-sm transition-colors ${location === "/explore" ? "text-[#171717] font-medium" : "text-[#4d4d4d] hover:text-[#171717]"}`}>
            Explore
          </Link>
          <Link href="/insights" className={`font-sans text-sm transition-colors ${location === "/insights" ? "text-[#171717] font-medium" : "text-[#4d4d4d] hover:text-[#171717]"}`}>
            Insights
          </Link>
          <Link href="/submit" className={`font-sans text-sm transition-colors ${location === "/submit" ? "text-[#171717] font-medium" : "text-[#4d4d4d] hover:text-[#171717]"}`}>
            Submit Your Story
          </Link>
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex flex-1 justify-end items-center gap-3">
          <Show when="signed-out">
            <Link href="/sign-in" className="flex items-center justify-center h-7 px-3 bg-white text-[#171717] border border-[#ebebeb] rounded-md font-sans text-sm hover:bg-[#f5f5f5] transition-colors">
              Log In
            </Link>
            <Link href="/sign-in" className="flex items-center justify-center h-7 px-3 bg-[#171717] text-white rounded-md font-sans text-sm hover:bg-[#333333] transition-colors shadow-sm">
              Submit Story
            </Link>
          </Show>
          <Show when="signed-in">
            <button onClick={logout} className="flex items-center justify-center h-7 px-3 bg-white text-[#171717] border border-[#ebebeb] rounded-md font-sans text-sm hover:bg-[#f5f5f5] transition-colors cursor-pointer">
              Log Out
            </button>
            <Link href="/submit" className="flex items-center justify-center h-7 px-3 bg-[#171717] text-white rounded-md font-sans text-sm hover:bg-[#333333] transition-colors shadow-sm">
              Submit Story
            </Link>
          </Show>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-[#171717] hover:bg-[#f5f5f5] p-2 rounded-md transition-colors focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[#ebebeb] bg-white w-full px-6 py-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <Link href="/explore" onClick={closeMenu} className={`font-sans text-base py-2 ${location === "/explore" ? "text-[#171717] font-medium" : "text-[#4d4d4d]"}`}>
            Explore
          </Link>
          <Link href="/insights" onClick={closeMenu} className={`font-sans text-base py-2 ${location === "/insights" ? "text-[#171717] font-medium" : "text-[#4d4d4d]"}`}>
            Insights
          </Link>
          <Link href="/submit" onClick={closeMenu} className={`font-sans text-base py-2 ${location === "/submit" ? "text-[#171717] font-medium" : "text-[#4d4d4d]"}`}>
            Submit Your Story
          </Link>
          <hr className="border-[#ebebeb]" />
          <div className="flex flex-col gap-2 pt-2">
            <Show when="signed-out">
              <Link href="/sign-in" onClick={closeMenu} className="flex items-center justify-center w-full h-10 bg-white text-[#171717] border border-[#ebebeb] rounded-md font-sans text-sm hover:bg-[#f5f5f5] transition-colors">
                Log In
              </Link>
              <Link href="/sign-in" onClick={closeMenu} className="flex items-center justify-center w-full h-10 bg-[#171717] text-white rounded-md font-sans text-sm hover:bg-[#333333] transition-colors">
                Submit Story
              </Link>
            </Show>
            <Show when="signed-in">
              <button 
                onClick={() => { logout(); closeMenu(); }} 
                className="flex items-center justify-center w-full h-10 bg-white text-[#171717] border border-[#ebebeb] rounded-md font-sans text-sm hover:bg-[#f5f5f5] transition-colors cursor-pointer"
              >
                Log Out ({user?.email})
              </button>
              <Link href="/submit" onClick={closeMenu} className="flex items-center justify-center w-full h-10 bg-[#171717] text-white rounded-md font-sans text-sm hover:bg-[#333333] transition-colors">
                Submit Story
              </Link>
            </Show>
          </div>
        </div>
      )}
    </nav>
  );
}
