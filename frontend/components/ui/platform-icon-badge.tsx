import { InstagramLogo, LinkedinLogo, XLogo } from "@phosphor-icons/react/dist/ssr";

type Platform = "linkedin" | "instagram" | "x";
type Size = "sm" | "md";

const containerSize: Record<Size, string> = {
  sm: "size-8 rounded",
  md: "size-10 rounded-lg",
};

const iconSize: Record<Size, number> = {
  sm: 18,
  md: 20,
};

const background: Record<Platform, string> = {
  linkedin: "bg-blue-600",
  instagram: "bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-500",
  x: "bg-gray-900 dark:bg-gray-600",
};

export function PlatformIconBadge({
  platform,
  size = "md",
  weight = "fill",
}: {
  platform: Platform;
  size?: Size;
  weight?: "fill" | "bold";
}) {
  const className = `${containerSize[size]} ${background[platform]} flex items-center justify-center`;
  const px = iconSize[size];

  return (
    <div className={className}>
      {platform === "linkedin" ? (
        <LinkedinLogo size={px} weight={weight} className="text-white" />
      ) : platform === "instagram" ? (
        <InstagramLogo size={px} weight={weight} className="text-white" />
      ) : (
        <XLogo size={px} weight={weight} className="text-white" />
      )}
    </div>
  );
}
