"use client";

import Script from "next/script";

export function Turnstile({ siteKey }: { siteKey: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-white/10 bg-white/[0.03] p-2">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <div
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-theme="dark"
        data-size="flexible"
        data-action="register"
      />
    </div>
  );
}
