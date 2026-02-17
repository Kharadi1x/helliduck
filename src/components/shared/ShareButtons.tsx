"use client";

import { useState } from "react";

interface ShareButtonsProps {
  text: string;
  url?: string;
}

export default function ShareButtons({ text, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const fullText = `${text}\n\nvia helliduck.com`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}&url=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullText + "\n" + shareUrl)}`;

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted mr-1">Share:</span>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs px-3 py-1.5 rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors"
      >
        Twitter
      </a>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs px-3 py-1.5 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
      >
        WhatsApp
      </a>
      <button
        onClick={copyLink}
        className="text-xs px-3 py-1.5 rounded-full bg-card-border text-muted hover:text-foreground transition-colors"
      >
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
}
