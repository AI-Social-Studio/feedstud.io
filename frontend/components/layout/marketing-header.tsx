import Image from "next/image";
import Link from "next/link";

export function MarketingHeader() {
  return (
    <header className="flex h-16 items-center border-b border-gray-100 bg-white px-8 dark:border-gray-800 dark:bg-gray-950">
      <Link href="/">
        <Image
          src="/socialstudio.png"
          alt="socialstudio.ai"
          width={99}
          height={32}
          priority
          className="dark:brightness-0 dark:invert"
        />
      </Link>
    </header>
  );
}
