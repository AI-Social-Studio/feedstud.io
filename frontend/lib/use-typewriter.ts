"use client";

import { useEffect, useState } from "react";

export function useTypewriter(text: string, delayMs: number) {
  const [state, setState] = useState({
    displayed: "",
    sourceText: text,
  });

  const displayed = state.sourceText === text ? state.displayed : "";

  useEffect(() => {
    if (state.sourceText !== text) {
      const resetTimeout = setTimeout(() => {
        setState({ displayed: "", sourceText: text });
      }, 0);

      return () => clearTimeout(resetTimeout);
    }

    if (state.displayed.length >= text.length) return;

    const timeout = setTimeout(() => {
      setState((current) => ({
        displayed: text.slice(0, current.displayed.length + 1),
        sourceText: text,
      }));
    }, delayMs);

    return () => clearTimeout(timeout);
  }, [delayMs, state.displayed, state.sourceText, text]);

  return displayed;
}
