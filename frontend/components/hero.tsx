"use client";

import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowRight, Plus } from "@phosphor-icons/react/dist/ssr";
import { renderCanvas } from "@/components/ui/canvas";
import { Button } from "@/components/ui/button";
import { useMountEffect } from "@/lib/use-mount-effect";
import { useTypewriter } from "@/lib/use-typewriter";

const FULL_TEXT = "The Smartest Way to Create Content.";

export function Hero() {
  const displayed = useTypewriter(FULL_TEXT, 38);
  const done = displayed.length >= FULL_TEXT.length;

  useMountEffect(() => renderCanvas());

  return (
    <section id="home" className="relative h-screen flex flex-col overflow-hidden bg-white">
      <nav className="relative z-10 flex items-center justify-between px-8 h-16 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <Image
          src="/socialstudio.png"
          alt="socialstudio.ai"
          width={99}
          height={32}
          priority
        />

        <div className="flex items-center gap-3">
          <SignInButton fallbackRedirectUrl="/dashboard" forceRedirectUrl="/dashboard">
            <Button variant="ghost" size="sm">Sign in</Button>
          </SignInButton>
          <SignUpButton fallbackRedirectUrl="/dashboard" forceRedirectUrl="/dashboard">
            <Button size="sm">
              Try it free
              <ArrowRight size={14} className="ml-1.5" />
            </Button>
          </SignUpButton>
        </div>
      </nav>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center animate-fade-in">
        <div className="mb-6">
          <div className="inline-flex items-center rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm px-3 py-1 text-xs text-gray-500">
            <span className="font-mono text-blue-600 mr-1.5 font-medium">ai.</span>
            automatic content repurposing for every platform
          </div>
        </div>

        <div className="mb-10 mt-4 md:mt-6">
          <div className="px-2">
            <div className="relative mx-auto h-full max-w-7xl border border-blue-500/30 p-6 [mask-image:radial-gradient(800rem_96rem_at_center,white,transparent)] md:px-12 md:py-20">
              <Plus size={40} weight="bold" className="text-blue-500 absolute -left-5 -top-5" />
              <Plus size={40} weight="bold" className="text-blue-500 absolute -bottom-5 -left-5" />
              <Plus size={40} weight="bold" className="text-blue-500 absolute -right-5 -top-5" />
              <Plus size={40} weight="bold" className="text-blue-500 absolute -bottom-5 -right-5" />
              <h1 className="flex select-none flex-col px-3 py-2 text-center text-5xl font-semibold leading-none tracking-tight text-gray-900 md:text-8xl">
                {displayed}
                {!done && (
                  <span className="inline-block w-[3px] h-[0.85em] bg-blue-500 ml-1 align-middle animate-pulse" />
                )}
              </h1>
            </div>
          </div>

          <p className="mx-auto mb-10 mt-8 max-w-2xl px-6 text-sm text-gray-500 sm:px-6 md:max-w-4xl md:px-20 lg:text-lg">
            Paste your raw ideas. Pick a platform. Get a finished post — tailored
            for LinkedIn, Instagram, or X with the right tone and format.
          </p>

          <Link href="/dashboard">
            <Button size="lg">Start Creating</Button>
          </Link>
        </div>
      </div>

      <canvas className="pointer-events-none absolute inset-0 mx-auto" id="canvas" />
    </section>
  );
}
