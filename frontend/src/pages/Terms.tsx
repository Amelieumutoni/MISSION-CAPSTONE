import React from "react";

export default function TermsPage() {
  const sections = [
    {
      title: "Artist Rights",
      content:
        "Artists retain full intellectual property rights to their physical works. Craftfolio is granted a non-exclusive, perpetual license to use digital representations of submitted works for documentation, archival, and promotional purposes.",
    },
    {
      title: "Authentication",
      content:
        "All works submitted for classification may undergo verification procedures. A work is only marked as verified after completing the required authentication process.",
    },
    {
      title: "Live Streaming",
      content:
        "Live streaming features are provided for viewing and discovery purposes. Unauthorized recording, redistribution, or reproduction of live sessions is strictly prohibited.",
    },
  ];

  return (
    <main className="bg-white text-slate-900 min-h-screen px-6 py-20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3 font-semibold">
            Legal
          </h3>
          <h1 className="text-4xl font-semibold tracking-tight">
            Terms and Conditions
          </h1>
          <p className="text-slate-600 mt-4">
            These terms govern the use of the Craftfolio platform and its
            services. By accessing or using the platform, you agree to the
            following conditions.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((sec, idx) => (
            <div key={idx}>
              <h2 className="text-xl font-semibold mb-3">
                {idx + 1}. {sec.title}
              </h2>
              <p className="text-slate-600 leading-relaxed">{sec.content}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-500">Last updated: March 2026</p>
        </div>
      </div>
    </main>
  );
}
