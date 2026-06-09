"use client";

import { useState, useEffect } from "react";

const HIRO_API_URL = process.env.NEXT_PUBLIC_HIRO_API_URL ?? "https://api.testnet.hiro.so";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    async function checkStatus() {
      // If browser reports offline, we are offline
      if (typeof window !== "undefined" && !window.navigator.onLine) {
        setIsOnline(false);
        return;
      }

      if (active) {
        setIsChecking(true);
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout

        const response = await fetch(`${HIRO_API_URL}/v2/info`, {
          method: "GET",
          signal: controller.signal,
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        clearTimeout(timeoutId);
        if (active) {
          setIsOnline(response.ok);
        }
      } catch {
        if (active) {
          setIsOnline(false);
        }
      } finally {
        if (active) {
          setIsChecking(false);
        }
      }
    }

    // Execute check after initial render completes
    checkStatus();

    const handleOnline = () => {
      checkStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    // Periodically re-ping every 30 seconds
    const intervalId = setInterval(checkStatus, 30000);

    return () => {
      active = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
      clearInterval(intervalId);
    };
  }, []);

  return { isOnline, isChecking };
}
