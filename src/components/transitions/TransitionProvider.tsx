"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import { GlitchOverlay } from "./GlitchOverlay";

interface TransitionContextValue {
  transitionsEnabled: boolean;
  toggleTransitions: () => void;
}

const TransitionContext = createContext<TransitionContextValue>({
  transitionsEnabled: true,
  toggleTransitions: () => {},
});

export function useTransition() {
  return useContext(TransitionContext);
}

export function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [transitionsEnabled, setTransitionsEnabled] = useState(true);
  const [showGlitch, setShowGlitch] = useState(false);
  const prevPathname = useRef(pathname);
  const mounted = useRef(false);

  // Load preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("spidaverse-transitions");
    if (stored === "false") setTransitionsEnabled(false);
    mounted.current = true;
  }, []);

  // Detect route changes
  useEffect(() => {
    if (!mounted.current) return;
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      if (transitionsEnabled) {
        setShowGlitch(true);
      }
    }
  }, [pathname, transitionsEnabled]);

  const toggleTransitions = useCallback(() => {
    setTransitionsEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("spidaverse-transitions", String(next));
      return next;
    });
  }, []);

  const handleGlitchComplete = useCallback(() => {
    setShowGlitch(false);
  }, []);

  return (
    <TransitionContext.Provider
      value={{ transitionsEnabled, toggleTransitions }}
    >
      {children}
      {showGlitch && <GlitchOverlay onComplete={handleGlitchComplete} />}
    </TransitionContext.Provider>
  );
}
