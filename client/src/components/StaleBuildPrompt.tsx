import { useCallback, useEffect, useState } from "react";

const BUILD_VERSION_KEY = "anabolics-africa-build-version";
const DISMISSED_VERSION_KEY = "anabolics-africa-dismissed-build-version";
const CHECK_INTERVAL_MS = 60_000;
const AUTO_REFRESH_DELAY_MS = 1_500;
const AUTO_REFRESHED_VERSION_KEY = "anabolics-africa-auto-refreshed-build-version";

function getVersionHeader(response: Response) {
  return response.headers.get("X-App-Version") ?? response.headers.get("ETag") ?? "";
}

export default function StaleBuildPrompt() {
  const [availableVersion, setAvailableVersion] = useState<string | null>(null);

  const isSafeToRefresh = useCallback(() => {
    const path = window.location.pathname;
    if (/^\/(checkout|login|register)(\/|$)/.test(path) || path.startsWith("/admin")) return false;
    if (document.querySelector("input:focus, textarea:focus, select:focus, [contenteditable=\"true\"]:focus")) return false;
    const hasUnsavedInput = Array.from(document.querySelectorAll("input, textarea, select"))
      .some((field) => field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement
        ? field.value.length > 0
        : false);
    return !hasUnsavedInput;
  }, []);

  const checkForNewBuild = useCallback(async () => {
    try {
      const response = await fetch(`/api/build-version?check=${Date.now()}`, {
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) return;
      const serverVersion = getVersionHeader(response);
      if (!serverVersion) return;

      const currentVersion = window.sessionStorage.getItem(BUILD_VERSION_KEY);
      if (!currentVersion) {
        window.sessionStorage.setItem(BUILD_VERSION_KEY, serverVersion);
        return;
      }
      if (serverVersion !== currentVersion && window.sessionStorage.getItem(DISMISSED_VERSION_KEY) !== serverVersion) {
        setAvailableVersion(serverVersion);
      }
    } catch {
      // Build checks are best-effort and must never interrupt the application.
    }
  }, []);

  useEffect(() => {
    void checkForNewBuild();
    const interval = window.setInterval(() => void checkForNewBuild(), CHECK_INTERVAL_MS);
    const onFocus = () => void checkForNewBuild();
    const onImageError = (event: Event) => {
      const image = event.target;
      if (image instanceof HTMLImageElement && image.currentSrc.includes("/manus-storage/")) {
        void checkForNewBuild();
      }
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("error", onImageError, true);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("error", onImageError, true);
    };
  }, [checkForNewBuild]);

  useEffect(() => {
    if (!availableVersion || !isSafeToRefresh()) return;
    if (window.sessionStorage.getItem(AUTO_REFRESHED_VERSION_KEY) === availableVersion) return;
    const timeout = window.setTimeout(() => {
      if (!isSafeToRefresh()) return;
      window.sessionStorage.setItem(AUTO_REFRESHED_VERSION_KEY, availableVersion);
      window.sessionStorage.setItem(BUILD_VERSION_KEY, availableVersion);
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("__build", availableVersion);
      window.location.replace(nextUrl.toString());
    }, AUTO_REFRESH_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [availableVersion, isSafeToRefresh]);

  if (!availableVersion) return null;

  const dismiss = () => {
    window.sessionStorage.setItem(DISMISSED_VERSION_KEY, availableVersion);
    setAvailableVersion(null);
  };

  const refresh = () => {
    window.sessionStorage.setItem(BUILD_VERSION_KEY, availableVersion);
    window.sessionStorage.removeItem(DISMISSED_VERSION_KEY);
    window.sessionStorage.setItem(AUTO_REFRESHED_VERSION_KEY, availableVersion);
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("__build", availableVersion);
    window.location.replace(nextUrl.toString());
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 top-3 z-[100] mx-auto flex max-w-xl items-center justify-between gap-3 border border-[#0EA5E9]/40 bg-[#0A0A0A]/95 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur md:inset-x-auto md:right-6 md:left-auto"
    >
      <p className="min-w-0 flex-1 leading-5">A newer version of Anabolics Africa is available.</p>
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={dismiss} className="px-2 py-1.5 text-white/70 underline underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]">
          Not now
        </button>
        <button type="button" onClick={refresh} className="bg-[#0EA5E9] px-3 py-1.5 font-semibold text-[#050505] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          Refresh
        </button>
      </div>
    </div>
  );
}
