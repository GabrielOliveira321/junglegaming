import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppProviders } from "@/providers/appProviders.tsx";
import { enableMocking } from "@/mocks/enableMocking";

function AppBootstrap() {
  const [mockReady, setMockReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    void enableMocking().finally(() => {
      if (mounted) {
        setMockReady(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!mockReady) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-6 sm:px-10">
        <div className="skeleton-shimmer h-12 w-full rounded-md" />
        <div className="skeleton-shimmer h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="skeleton-shimmer h-48 rounded-xl" />
          <div className="skeleton-shimmer h-48 rounded-xl" />
          <div className="skeleton-shimmer h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <AppProviders>
      <App />
    </AppProviders>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppBootstrap />
  </StrictMode>,
);
