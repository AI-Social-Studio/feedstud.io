"use client";

import Image from "next/image";
import Link from "next/link";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import {PlusIcon} from "@phosphor-icons/react/dist/ssr";
import { renderCanvas } from "@/components/ui/canvas";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useDictionary } from "@/lib/i18n";
import { useMountEffect } from "@/lib/use-mount-effect";
import { useTypewriter } from "@/lib/use-typewriter";
import {ArrowRightIcon} from "@phosphor-icons/react";

export function Hero() {
  const dict = useDictionary();
  const displayed = useTypewriter(dict.hero.headline, 38);
  const done = displayed.length >= dict.hero.headline.length;

  useMountEffect(() => renderCanvas());

  return (
    <section
      id="home"
      className="relative flex h-screen flex-col overflow-hidden bg-white dark:bg-gray-950"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hero-grid absolute -inset-8" />
      </div>
      <nav className="relative z-20 flex flex-col gap-3 border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur-sm sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-8 sm:py-0 dark:border-gray-800 dark:bg-gray-950/80">
        <div className="flex items-center justify-between">
          <Image
            src="/feedstudio.png"
            alt="feedstud.io"
            width={112}
            height={36}
            priority
            className="dark:brightness-0 dark:invert"
          />
          <div className="sm:hidden">
            <LanguageToggle direction="down" />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <LanguageToggle direction="down" />
          </div>
          <Show when="signed-out">
            <SignInButton fallbackRedirectUrl="/dashboard" forceRedirectUrl="/dashboard">
              <Button variant="ghost" size="sm" className="flex-1 sm:flex-none">
                {dict.common.signIn}
              </Button>
            </SignInButton>
            <SignUpButton fallbackRedirectUrl="/dashboard" forceRedirectUrl="/dashboard">
              <Button size="sm" className="flex-1 sm:flex-none">
                {dict.common.tryItFree}
                <ArrowRightIcon size={14} className="ml-1.5" />
              </Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className="flex-1 sm:flex-none">
              <Button size="sm" className="w-full sm:w-auto">
                {dict.common.goToDashboard}
                <ArrowRightIcon size={14} className="ml-1.5" />
              </Button>
            </Link>
          </Show>
        </div>
      </nav>

      <div className="animate-fade-in relative z-10 flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="mt-4 mb-10 md:mt-6">
          <div className="px-2">
            <div className="relative container h-full max-w-7xl border border-blue-500/30 mask-[radial-gradient(800rem_96rem_at_center,white,transparent)] p-6 md:px-12 md:py-20">
              <PlusIcon size={40} weight="bold" className="absolute -top-5 -left-5 text-blue-500" />
              <PlusIcon size={40} weight="bold" className="absolute -bottom-5 -left-5 text-blue-500" />
              <PlusIcon size={40} weight="bold" className="absolute -top-5 -right-5 text-blue-500" />
              <PlusIcon size={40} weight="bold" className="absolute -right-5 -bottom-5 text-blue-500" />
              <h1 className="px-3 py-2 text-center text-5xl leading-none font-semibold tracking-tight text-gray-900 select-none md:text-8xl dark:text-gray-50">
                {displayed}
                {!done && (
                  <span className="ml-1 inline-block h-[0.85em] w-0.75 animate-pulse bg-[#3b82f6] align-middle" />
                )}
              </h1>
            </div>
          </div>

          <p className="mx-auto mt-8 mb-10 max-w-2xl px-6 text-sm text-gray-500 sm:px-6 md:max-w-4xl md:px-20 lg:text-lg dark:text-gray-400">
            {dict.hero.subtitle}
          </p>

          <Link href="/dashboard">
            <Button size="lg">{dict.hero.cta}</Button>
          </Link>
        </div>
      </div>

      <canvas className="pointer-events-none absolute inset-0 mx-auto" id="canvas" />
    </section>
  );
}
