"use client";

import { NextStudio } from "next-sanity/studio";
import { useEffect } from "react";
import config from "../../../../sanity/sanity.config";

export default function StudioPage() {
  // Hide site header/footer and take over the full viewport
  useEffect(() => {
    document.body.classList.add("sanity-studio-active");
    return () => {
      document.body.classList.remove("sanity-studio-active");
    };
  }, []);

  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#101112] text-white/70 p-8">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Studio Not Configured</h1>
          <p>
            Set <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm">NEXT_PUBLIC_SANITY_PROJECT_ID</code> in
            your <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm">.env.local</code> to connect Sanity Studio.
          </p>
        </div>
      </div>
    );
  }

  return <NextStudio config={config} />;
}
