"use client";

import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/landing/footer";
import { useDictionary } from "@/lib/i18n";
import { MarketingHeader } from "./marketing-header";
import { GithubLogoIcon, GlobeIcon, LinkedinLogoIcon } from "@phosphor-icons/react";

export function AuthorsPage() {
  const dict = useDictionary();

  const authors = [
    {
      name: "Norbert Fila",
      role: dict.authors.roles.norbert,
      github: "https://github.com/Nubet",
      linkedin: "https://www.linkedin.com/in/norbert-fila/",
      website: "https://norbertfila.com/",
      image: "/authors/norbert.jpg",
    },
    {
      name: "Bartłomiej Ćwiklak",
      role: dict.authors.roles.bartlomiej,
      github: "https://github.com/bartlomiejcwiklak",
      linkedin: "https://www.linkedin.com/in/bartlomiejcwiklak",
      website: "https://bartlomiejcwiklak.com/",
      image: "/authors/bartlomiej.jpg",
    },
    {
      name: "Szymon Chełmiński",
      role: dict.authors.roles.szymon,
      github: "https://github.com/SzymonChelminski",
      linkedin: "https://www.linkedin.com/in/szymon-chełmiński",
      image: "/authors/szymon.jpg",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1 bg-white px-4 py-16 dark:bg-gray-950">
        <div className="animate-page-in container mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl dark:text-gray-50">
              {dict.authors.title}
            </h1>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">{dict.authors.subtitle}</p>
          </div>

          <div className="mb-12">
            <h2 className="mb-8 text-center text-xs font-semibold tracking-wider text-gray-400 uppercase dark:text-gray-500">
              {dict.authors.cofounders}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {authors.map((author) => (
                <div
                  key={author.name}
                  className="group relative flex flex-col items-center rounded-3xl border border-gray-100 bg-gray-50/50 p-8 text-center transition-all hover:border-gray-200 hover:bg-white hover:shadow-sm dark:border-gray-800 dark:bg-gray-900/30 dark:hover:border-gray-800 dark:hover:bg-gray-900"
                >
                  <div className="mb-6 flex h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white text-2xl font-bold text-gray-900 shadow-sm dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:shadow-none">
                    {author.image ? (
                      <Image
                        src={author.image}
                        alt={author.name}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        {author.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {author.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{author.role}</p>
                  <div className="mt-8 flex flex-wrap justify-center gap-5">
                    {author.website && (
                      <Link
                        href={author.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 transition-colors hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-100"
                        title={dict.authors.visitWebsite}
                      >
                        <GlobeIcon weight="regular" className="size-5" />
                        <span className="sr-only">{dict.authors.visitWebsite}</span>
                      </Link>
                    )}
                    {author.github && (
                      <Link
                        href={author.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 transition-colors hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-100"
                        title={dict.authors.githubProfile}
                      >
                        <GithubLogoIcon weight="regular" className="size-5" />
                        <span className="sr-only">{dict.authors.githubProfile}</span>
                      </Link>
                    )}
                    {author.linkedin && (
                      <Link
                        href={author.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 transition-colors hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400"
                        title={dict.authors.linkedinProfile}
                      >
                        <LinkedinLogoIcon weight="regular" className="size-5" />
                        <span className="sr-only">{dict.authors.linkedinProfile}</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
