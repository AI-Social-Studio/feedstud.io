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
    <section className="relative py-24 px-4 overflow-hidden bg-blue-700">
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
      <Reveal className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-white mb-4">
          {dict.cta.title}
        </h2>
        <p className="text-blue-100 mb-10 text-lg">{dict.cta.subtitle}</p>
        <Link href="/dashboard">
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold transition-transform duration-200 hover:scale-105"
          >
            {dict.cta.button}
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </Link>
      </Reveal>
    </section>
  );
}
