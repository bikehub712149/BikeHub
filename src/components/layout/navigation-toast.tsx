"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

const navigationStartEvent = "navigation-start";
const bikeDetailsReadyEvent = "bike-details-ready";

function isInternalNavigation(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;

  const link = target.closest("a[href]");
  if (!(link instanceof HTMLAnchorElement)) return null;
  if (link.target === "_blank" || link.hasAttribute("download")) return null;

  const url = new URL(link.href);
  if (url.origin !== window.location.origin) return null;

  return `${url.pathname}${url.search}${url.hash}`;
}

export default function NavigationToast() {
  const pathname = usePathname();
  const toastId = useRef<string | number | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPath = useRef<string | null>(null);

  useEffect(() => {
    const dismiss = () => {
      if (toastId.current) toast.dismiss(toastId.current);
      toastId.current = null;
      pendingPath.current = null;

      if (timeout.current) {
        clearTimeout(timeout.current);
        timeout.current = null;
      }
    };

    const start = (destination: string) => {
      const destinationPath = destination.split(/[?#]/)[0];
      if (destinationPath === window.location.pathname) return;

      dismiss();
      pendingPath.current = destination;
      toastId.current = toast.custom(
        () => (
          <div className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm shadow-lg">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span className="flex items-center">
              Loading bike details
              <span className="ml-1 inline-flex w-5" aria-hidden="true">
                <span className="animate-bounce [animation-delay:-0.3s]">.</span>
                <span className="animate-bounce [animation-delay:-0.15s]">.</span>
                <span className="animate-bounce">.</span>
              </span>
            </span>
          </div>
        ),
        { duration: 15000 },
      );

      timeout.current = setTimeout(dismiss, 15000);
    };

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      const destination = isInternalNavigation(event.target);
      if (destination) start(destination);
    };

    const handleNavigationStart = (event: Event) => {
      const destination = (event as CustomEvent<string>).detail;
      if (destination) start(destination);
    };

    const handleBikeDetailsReady = () => dismiss();

    document.addEventListener("click", handleClick, true);
    window.addEventListener(navigationStartEvent, handleNavigationStart);
    window.addEventListener(bikeDetailsReadyEvent, handleBikeDetailsReady);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener(navigationStartEvent, handleNavigationStart);
      window.removeEventListener(bikeDetailsReadyEvent, handleBikeDetailsReady);
      dismiss();
    };
  }, []);

  useEffect(() => {
    if (!pendingPath.current || pathname !== pendingPath.current.split(/[?#]/)[0]) {
      return;
    }

    if (!pathname.startsWith("/inventory/") || pathname === "/inventory") {
      if (toastId.current) toast.dismiss(toastId.current);
      toastId.current = null;
      pendingPath.current = null;
    }
  }, [pathname]);

  return null;
}