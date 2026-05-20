"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

export default function FloatingDonation() {
  const pathname = usePathname();
  const initialized = useRef(false);

  // Don't show Ko-fi on admin or curator pages
  const isStaffArea = pathname?.includes("/admin") || pathname?.includes("/curator");

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).kofiWidgetOverlay && !initialized.current) {
      initialized.current = true;
      (window as any).kofiWidgetOverlay.draw("cultmachine", {
        type: "floating-chat",
        "floating-chat.donateButton.text": "Support me",
        "floating-chat.donateButton.background-color": "#000000",
        "floating-chat.donateButton.text-color": "#F5E000",
      });
    }
  }, []);

  // Don't render on admin/curator pages
  if (isStaffArea) return null;

  return (
    <>
      <Script
        src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (typeof window !== "undefined" && (window as any).kofiWidgetOverlay && !initialized.current) {
            initialized.current = true;
            (window as any).kofiWidgetOverlay.draw("cultmachine", {
              type: "floating-chat",
              "floating-chat.donateButton.text": "Support me",
              "floating-chat.donateButton.background-color": "#000000",
              "floating-chat.donateButton.text-color": "#F5E000",
            });
          }
        }}
      />
    </>
  );
}
