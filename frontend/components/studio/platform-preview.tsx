import Image from "next/image";
import { useState } from "react";
import {
  ArrowsClockwise,
  BookmarkSimple,
  CaretLeft,
  CaretRight,
  ChartBar,
  ChatCircle,
  DotsThree,
  Heart,
  PaperPlaneTilt,
  ThumbsUp,
  XLogo,
} from "@phosphor-icons/react/dist/ssr";
import type { Platform } from "./content-engine";

type Props = {
  platform: Platform;
  text: string;
  images: string[];
};

function Avatar({ size }: { size: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-linear-to-tr from-blue-500 to-violet-500 font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      YN
    </div>
  );
}

function FeedImage({ src, ratio }: { src: string; ratio: string }) {
  if (
    src.startsWith("blob:") ||
    src.startsWith("http://localhost") ||
    src.startsWith("https://localhost")
  ) {
    return (
      <div className={`relative w-full ${ratio} bg-gray-100`}>
        {/* Blob and localhost previews bypass next/image optimization intentionally. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`relative w-full ${ratio} bg-gray-100`}>
      <Image src={src} alt="" fill sizes="480px" className="object-cover" />
    </div>
  );
}

function MediaCarousel({ images, ratio }: { images: string[]; ratio: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) return null;

  const lastIndex = images.length - 1;
  const currentIndex = Math.min(activeIndex, lastIndex);
  const currentImage = images[currentIndex];

  return (
    <div className="relative">
      <FeedImage src={currentImage} ratio={ratio} />
      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => setActiveIndex((index) => (index === 0 ? lastIndex : index - 1))}
            className="absolute top-1/2 left-3 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/75"
            aria-label="Poprzednie zdjęcie"
          >
            <CaretLeft size={18} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex((index) => (index === lastIndex ? 0 : index + 1))}
            className="absolute top-1/2 right-3 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/75"
            aria-label="Następne zdjęcie"
          >
            <CaretRight size={18} weight="bold" />
          </button>
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? "w-5 bg-white" : "w-2 bg-white/60 hover:bg-white/80"
                }`}
                aria-label={`Pokaż zdjęcie ${index + 1}`}
              />
            ))}
          </div>
          <div className="absolute top-3 right-3 rounded-full bg-black/60 px-2 py-1 text-[11px] font-medium text-white">
            {currentIndex + 1}/{images.length}
          </div>
        </>
      ) : null}
    </div>
  );
}

function LinkedInPreview({ text, images }: { text: string; images: string[] }) {
  return (
    <div className="w-full max-w-[480px] overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-start gap-3 p-4">
        <Avatar size={48} />
        <div className="min-w-0 flex-1">
          <div className="text-sm leading-tight font-semibold text-gray-900">Your Name</div>
          <div className="text-xs leading-tight text-gray-500">Senior Engineer · 1st</div>
          <div className="mt-0.5 text-xs leading-tight text-gray-400">2h · 🌐</div>
        </div>
        <DotsThree size={20} className="shrink-0 text-gray-400" />
      </div>
      <div className="px-4 pb-3 text-sm leading-relaxed whitespace-pre-line text-gray-800">
        {text}
      </div>
      <MediaCarousel images={images} ratio="aspect-video" />
      <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500">
        👍 ❤️ 128 · 14 komentarzy
      </div>
      <div className="grid grid-cols-4 border-t border-gray-100 text-gray-500">
        <ActionButton icon={<ThumbsUp size={18} />} label="Lubię to" />
        <ActionButton icon={<ChatCircle size={18} />} label="Komentarz" />
        <ActionButton icon={<ArrowsClockwise size={18} />} label="Udostępnij" />
        <ActionButton icon={<PaperPlaneTilt size={18} />} label="Wyślij" />
      </div>
    </div>
  );
}

function InstagramPreview({ text, images }: { text: string; images: string[] }) {
  return (
    <div className="w-full max-w-[400px] overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-3 p-3">
        <div className="rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-500 p-[2px]">
          <div className="rounded-full bg-white p-[2px]">
            <Avatar size={32} />
          </div>
        </div>
        <span className="flex-1 text-sm font-semibold text-gray-900">yourname</span>
        <DotsThree size={20} className="text-gray-500" />
      </div>
      <MediaCarousel images={images} ratio="aspect-square" />
      <div className="flex items-center gap-4 px-3 pt-3 text-gray-800">
        <Heart size={24} />
        <ChatCircle size={24} />
        <PaperPlaneTilt size={24} />
        <BookmarkSimple size={24} className="ml-auto" />
      </div>
      <div className="px-3 pt-2 text-sm font-semibold text-gray-900">1 248 polubień</div>
      <div className="px-3 pt-1 pb-3 text-sm leading-relaxed whitespace-pre-line text-gray-800">
        <span className="font-semibold">yourname</span> {text}
      </div>
    </div>
  );
}

function XPreview({ text, images }: { text: string; images: string[] }) {
  return (
    <div className="w-full max-w-[480px] rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <Avatar size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-sm leading-tight">
            <span className="font-bold text-gray-900">Your Name</span>
            <span className="text-gray-500">@yourname · 1h</span>
          </div>
          <div className="mt-1 text-[15px] leading-relaxed whitespace-pre-line text-gray-900">
            {text}
          </div>
          {images.length > 0 ? (
            <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
              <MediaCarousel images={images} ratio="aspect-video" />
            </div>
          ) : null}
          <div className="mt-3 flex max-w-[320px] items-center justify-between text-gray-500">
            <Stat icon={<ChatCircle size={18} />} value="24" />
            <Stat icon={<ArrowsClockwise size={18} />} value="18" />
            <Stat icon={<Heart size={18} />} value="142" />
            <Stat icon={<ChartBar size={18} />} value="2,4 tys." />
            <PaperPlaneTilt size={18} />
          </div>
        </div>
        <XLogo size={18} weight="bold" className="shrink-0 text-gray-900" />
      </div>
    </div>
  );
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors hover:bg-gray-50">
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs">
      {icon}
      {value}
    </span>
  );
}

export function PlatformPreview({ platform, text, images }: Props) {
  if (platform === "linkedin") return <LinkedInPreview text={text} images={images} />;
  if (platform === "instagram") return <InstagramPreview text={text} images={images} />;
  return <XPreview text={text} images={images} />;
}
