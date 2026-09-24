import { useState, useEffect } from "react";

export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= breakpoint;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const updateMatches = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };

    updateMatches(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateMatches);
      return () => mediaQuery.removeEventListener("change", updateMatches);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(updateMatches);
      return () => mediaQuery.removeListener(updateMatches);
    }
  }, [breakpoint]);

  return isMobile;
}
