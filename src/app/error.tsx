'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary Caught Exception:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-[#e8e4dc]">
      <div className="w-full max-w-2xl p-8 border border-red-500/30 rounded-2xl bg-red-950/20 shadow-2xl flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-red-500/30 pb-4">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <h2 className="text-2xl font-black tracking-widest text-red-500 uppercase">Fatal Crash Caught</h2>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-400 opacity-80">Exception Output:</p>
          <div className="p-4 rounded-lg bg-black/50 border border-red-900/50 font-mono text-sm leading-relaxed text-red-200 overflow-x-auto whitespace-pre-wrap break-words">
            {error.message || "An unknown fatal exception severed the rendering chain."}
          </div>
        </div>

        {error.digest && (
          <div className="text-xs text-red-500/50 font-mono">
            Digest ID: {error.digest}
          </div>
        )}

        <button
          onClick={() => reset()}
          className="mt-2 px-6 py-3 bg-red-900/30 hover:bg-red-600 hover:scale-[1.02] transition-all text-red-100 font-bold tracking-wider uppercase rounded-lg border border-red-500/50 active:scale-95"
        >
          Attempt Recovery
        </button>
      </div>
    </div>
  );
}
