"use client";

import ShareButtons from "./ShareButtons";

interface ResultCardProps {
  children: React.ReactNode;
  shareText?: string;
  shareUrl?: string;
}

export default function ResultCard({ children, shareText, shareUrl }: ResultCardProps) {
  return (
    <div className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-4">
      {children}
      {shareText && (
        <div className="pt-4 border-t border-card-border">
          <ShareButtons text={shareText} url={shareUrl} />
        </div>
      )}
    </div>
  );
}
