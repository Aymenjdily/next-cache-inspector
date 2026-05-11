"use client";

import { useState } from "react";
import { Bell, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

const benefits = [
  "New feature announcements",
  "Next.js caching best practices",
  "Performance optimization tips",
  "Early access to beta releases",
];

export default function NewsletterSection(): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await res.json()) as { message?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden border-t border-[#333] bg-[#111]">
      {/* Subtle glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[400px] w-[400px] rounded-full bg-[#FFC000]/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left: Copy */}
          <div>
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#333] bg-[#1a1a1a]">
              <Bell className="h-5 w-5 text-[#FFC000]" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Get updates & tips
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Join developers who receive monthly insights on Next.js caching,
              new inspector features, and performance optimization strategies.
            </p>

            <ul className="mt-6 space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2.5 text-sm text-gray-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#FFC000]" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Form */}
          <div className="rounded-xl border border-[#333] bg-[#111] p-1 shadow-xl">
            <div className="rounded-lg bg-[#0a0a0a] p-6 sm:p-8">
              {submitted ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                    <Zap className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    You&apos;re subscribed!
                  </h3>
                  <p className="mt-2 text-sm text-gray-400">
                    Watch your inbox for the next update.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-semibold text-white">
                    Subscribe to the newsletter
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    No spam. Unsubscribe anytime.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                    <div>
                      <label htmlFor="newsletter-email" className="sr-only">
                        Email address
                      </label>
                      <input
                        id="newsletter-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        disabled={loading}
                        className="w-full rounded-lg border border-[#333] bg-[#111] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-[#FFC000] disabled:opacity-50"
                      />
                    </div>
                    {error ? (
                      <p className="text-xs text-red-400">{error}</p>
                    ) : null}
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FFC000] px-4 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-[#E6AC00] disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                      ) : (
                        <>
                          Subscribe
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="mt-4 text-center text-[10px] text-gray-600">
                    Join 1,200+ developers. We respect your privacy.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
