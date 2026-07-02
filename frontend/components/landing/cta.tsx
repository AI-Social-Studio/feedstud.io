"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { DitheringShader } from "@/components/ui/dithering-shader";
import { Reveal } from "@/components/ui/reveal";
import { useDictionary } from "@/lib/i18n";

export function CtaSection() {
  const dict = useDictionary();

  return (
    <section className="relative overflow-hidden bg-blue-700 px-4 py-24">
      <DitheringShader
        width={1920}
        height={400}
        colorBack="#1d4ed8"
        colorFront="#93c5fd"
        pxSize={4}
        speed={0.9}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />
      <Reveal className="relative z-10 container max-w-3xl text-center">
        <h2 className="mb-4 text-4xl font-semibold tracking-tight text-white">{dict.cta.title}</h2>
        <p className="mb-10 text-lg text-blue-100">{dict.cta.subtitle}</p>
        <Link href="/dashboard">
          <Button
            size="lg"
            className="bg-white font-semibold text-blue-600 transition-transform duration-200 hover:scale-105 hover:bg-blue-50"
          >
            {dict.cta.button}
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </Link>
      </Reveal>
    </section>
  );
}
