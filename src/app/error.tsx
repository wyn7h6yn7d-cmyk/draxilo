"use client";

import * as React from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    // Intentionally minimal: detailed logging is handled server-side.
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-zinc-950 dark:bg-black dark:text-zinc-50">
        <div className="mx-auto max-w-xl px-6 py-16">
          <div className="text-sm font-semibold tracking-tight">Draxion</div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Something went wrong.</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Try again. If this keeps happening, check server logs.
          </p>
          <button
            onClick={() => reset()}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}

