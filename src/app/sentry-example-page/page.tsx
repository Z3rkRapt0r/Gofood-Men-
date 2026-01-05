"use client";

import { useEffect, useState } from "react";
// import * as Sentry from "@sentry/nextjs";

export default function SentryTestPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-4">
            <h1 className="text-2xl font-bold">Sentry Verification Page</h1>
            <p className="max-w-md text-center">
                Click the button below to intentionally throw an error.
                This error should show up in your Sentry dashboard.
            </p>

            <button
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                onClick={() => {
                    throw new Error("Sentry Test Error from Client Side");
                }}
            >
                Throw Client Error
            </button>

            {/* <button
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        onClick={async () => {
          await fetch("/api/sentry-test");
        }}
      >
        Trigger Server Error (API)
      </button> */}
        </div>
    );
}
