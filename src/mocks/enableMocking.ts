let mockingStartPromise: Promise<void> | null = null;
let mockingStarted = false;

export async function enableMocking() {
  const shouldEnableMocks = import.meta.env.VITE_ENABLE_MSW !== "false";
  if (!shouldEnableMocks) {
    return;
  }

  if (mockingStarted) {
    return;
  }

  if (mockingStartPromise) {
    return mockingStartPromise;
  }

  mockingStartPromise = (async () => {
    const { worker } = await import("@/mocks/browser");
    try {
      await worker.start({
        onUnhandledRequest: "bypass",
      });
      mockingStarted = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!message.includes("worker is already started")) {
        throw error;
      }
      mockingStarted = true;
    }
  })();

  return mockingStartPromise;
}
