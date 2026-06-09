import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export function SignInForm() {
  const { login, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError("Please fill in all fields");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setFormError(err.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#ebebeb] p-8 w-[400px] max-w-full shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-[#171717] tracking-tight">Welcome back</h2>
        <p className="text-sm text-[#888888] mt-1">Sign in to your account</p>
      </div>

      {(formError || error) && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-100">
          {formError || error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#4d4d4d] mb-1">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3 border border-[#ebebeb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#171717] text-sm bg-white"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4d4d4d] mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 px-3 border border-[#ebebeb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#171717] text-sm bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-10 bg-[#171717] hover:bg-[#333] text-white rounded-md font-medium text-sm transition-colors shadow-sm disabled:opacity-50 mt-6 cursor-pointer"
        >
          {submitting ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="text-center mt-6 text-sm text-[#888888]">
        Don't have an account?{" "}
        <Link href="/sign-up" className="text-[#0070f3] hover:underline font-medium">
          Sign up
        </Link>
      </div>
    </div>
  );
}

export function SignUpForm() {
  const { register, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await register(email, password);
    } catch (err: any) {
      setFormError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#ebebeb] p-8 w-[400px] max-w-full shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-[#171717] tracking-tight">Create an account</h2>
        <p className="text-sm text-[#888888] mt-1">Join the founder knowledge base</p>
      </div>

      {(formError || error) && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-100">
          {formError || error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#4d4d4d] mb-1">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3 border border-[#ebebeb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#171717] text-sm bg-white"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4d4d4d] mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 px-3 border border-[#ebebeb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#171717] text-sm bg-white"
            placeholder="Min. 6 characters"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-10 bg-[#171717] hover:bg-[#333] text-white rounded-md font-medium text-sm transition-colors shadow-sm disabled:opacity-50 mt-6 cursor-pointer"
        >
          {submitting ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <div className="text-center mt-6 text-sm text-[#888888]">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-[#0070f3] hover:underline font-medium">
          Log in
        </Link>
      </div>
    </div>
  );
}
