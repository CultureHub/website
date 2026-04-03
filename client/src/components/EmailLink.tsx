"use client";

import { useState } from "react";

type EmailLinkProps = {
  email: string;
};

export default function EmailLink({ email }: EmailLinkProps) {
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      setTimeout(() => {
        setCopiedEmail(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy email: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = email;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopiedEmail(true);
        setTimeout(() => {
          setCopiedEmail(false);
        }, 2000);
      } catch (fallbackErr) {
        console.error("Fallback copy failed: ", fallbackErr);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  return (
    <button
      onClick={() => handleCopyEmail()}
      className="text-ch-teal hover:text-ch-lite transition-colors cursor-pointer text-left relative group"
      title="Click to copy email"
    >
      {email}
      {copiedEmail && (
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-ch-lite text-ch-midnite px-2 py-1 rounded text-sm whitespace-nowrap">
          Copied!
        </span>
      )}
    </button>
  );
}
