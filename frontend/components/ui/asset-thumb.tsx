import Image from "next/image";
import { X } from "@phosphor-icons/react/dist/ssr";
import { SmileyWink } from "@phosphor-icons/react/dist/ssr";

type ImageThumb = {
  kind: "image";
  src: string;
  alt: string;
  objectPosition?: "top" | "center";
  onRemove?: () => void;
  removeDisabled?: boolean;
  removeLabel?: string;
};

type MemeThumb = {
  kind: "meme";
  label: string;
};

export function AssetThumb(props: ImageThumb | MemeThumb) {
  if (props.kind === "meme") {
    return (
      <div className="relative rounded-md overflow-hidden border border-gray-200 bg-yellow-100 flex items-center justify-center aspect-video dark:border-gray-700 dark:bg-yellow-500/20">
        <SmileyWink size={28} weight="fill" className="text-yellow-500" />
        <span className="absolute bottom-1 left-1 bg-white/80 text-[9px] font-medium px-1.5 rounded text-gray-700 dark:bg-gray-900/80 dark:text-gray-300">
          {props.label}
        </span>
      </div>
    );
  }

  const positionClass =
    props.objectPosition === "top" ? "object-cover object-top" : "object-cover";

  if (props.src.startsWith("blob:") || props.src.startsWith("http://localhost")) {
    return (
      <div className="relative rounded-md overflow-hidden border border-gray-200 aspect-video dark:border-gray-700">
        {props.onRemove ? (
          <RemoveButton
            onClick={props.onRemove}
            disabled={props.removeDisabled}
            label={props.removeLabel}
          />
        ) : null}
        <img src={props.src} alt={props.alt} className={`h-full w-full ${positionClass}`} />
      </div>
    );
  }

  return (
    <div className="relative rounded-md overflow-hidden border border-gray-200 aspect-video dark:border-gray-700">
      {props.onRemove ? (
        <RemoveButton
          onClick={props.onRemove}
          disabled={props.removeDisabled}
          label={props.removeLabel}
        />
      ) : null}
      <Image
        src={props.src}
        alt={props.alt}
        fill
        sizes="(max-width: 1024px) 50vw, 200px"
        className={positionClass}
      />
    </div>
  );
}

function RemoveButton({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/85 disabled:pointer-events-none disabled:opacity-50"
      aria-label={label ?? "Usuń plik"}
      title={label ?? "Usuń plik"}
    >
      <X size={14} weight="bold" />
    </button>
  );
}
