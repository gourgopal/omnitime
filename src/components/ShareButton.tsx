"use client";

import { Share2 } from "lucide-react";
import html2canvas from "html2canvas";

export function ShareButton() {
  const handleShare = async () => {
    try {
      const element = document.body;
      const canvas = await html2canvas(element, {
        logging: false,
        useCORS: true,
        scale: 2, // High resolution
        ignoreElements: (node) => node.tagName === "BUTTON", // Hide buttons in screenshot
      });

      const image = canvas.toDataURL("image/png");

      // Use Web Share API if available (Mobile/Modern Browsers)
      if (navigator.share) {
        const blob = await (await fetch(image)).blob();
        const file = new File([blob], "omnitime-share.png", { type: "image/png" });
        await navigator.share({
          title: "OmniTime",
          text: "Check out my time stats from OmniTime!",
          files: [file],
        });
      } else {
        // Fallback: Download image
        const link = document.createElement("a");
        link.href = image;
        link.download = "omnitime-share.png";
        link.click();
      }
    } catch (e) {
      console.error("Failed to share", e);
      alert("Failed to create screenshot for sharing.");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="fixed bottom-6 right-6 p-4 rounded-full bg-primary text-white shadow-xl hover:bg-blue-600 transition-colors z-50 flex items-center justify-center"
      aria-label="Share screen"
    >
      <Share2 size={24} />
    </button>
  );
}
