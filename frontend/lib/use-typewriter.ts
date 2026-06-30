"use client";

import { useEffect, useState } from "react";

export function useTypewriter(text: string, delayMs: number) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (displayed.length >= text.length) return;

    const timeout = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, delayMs);

    return () => clearTimeout(timeout);
  }, [delayMs, displayed, text]);

  return displayed;
}
