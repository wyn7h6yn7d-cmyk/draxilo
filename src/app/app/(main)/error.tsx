"use client";

import * as React from "react";
import Link from "next/link";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Something went wrong.</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Try again, or go back to the dashboard.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => reset()}
          className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Retry
        </button>
        <Link
          href="/app"
          className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

