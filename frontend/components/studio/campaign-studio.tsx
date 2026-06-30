"use client";

import { useRef, useState } from "react";
import {
  Check,
  CheckCircle,
  Copy,
  Hash,
  Megaphone,
  Plus,
  Scissors,
  SmileyWink,
  Sparkle,
  TextAa,
} from "@phosphor-icons/react/dist/ssr";
import { AssetThumb } from "@/components/ui/asset-thumb";
import { PlatformIconBadge } from "@/components/ui/platform-icon-badge";
import { StepHeader } from "@/components/ui/step-header";
import { PlatformPreview } from "./platform-preview";
import {
  PLATFORM_META,
  PLATFORM_ORDER,
  type Platform,
  type RefineAction,
} from "./content-engine";
import {
  createDraft,
  generatePosts,
  getApiErrorMessage,
  refinePost,
  updateDraft,
  uploadFiles,
  type Draft,
  type UploadedFile,
} from "@/lib/flowforge-api";

const DEMO_IMAGE: Record<Platform, string | undefined> = {
  linkedin:
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=640&q=80",
  instagram:
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=640&q=80",
  x: undefined,
};

type AssetPreview =
  | { kind: "image"; src: string; alt: string; objectPosition?: "top" | "center"; fileId?: string }
  | { kind: "meme"; label: string };

type Toast = {
  id: number;
  tone: "success" | "error" | "info";
  message: string;
};

type Props = {
  initialDraft?: Draft | null;
};

const INITIAL_ASSETS: AssetPreview[] = [
  {
    kind: "image",
    src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80",
    alt: "Code snippet",
  },
  {
    kind: "image",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    alt: "Developer selfie",
    objectPosition: "top",
  },
  {
    kind: "image",
    src: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80",
    alt: "Pizza photo",
  },
  { kind: "meme", label: "meme.jpg" },
];

const REFINE_ACTIONS: {
  action: RefineAction;
  label: string;
  icon: React.ReactNode;
}[] = [
  { action: "hook", label: "Zmień Hook", icon: <Sparkle size={13} weight="bold" /> },
  { action: "shorten", label: "Skróć", icon: <Scissors size={13} weight="bold" /> },
  {
    action: "formal",
    label: "Bardziej formalnie",
    icon: <TextAa size={13} weight="bold" />,
  },
  {
    action: "casual",
    label: "Luźniej",
    icon: <SmileyWink size={13} weight="bold" />,
  },
  { action: "cta", label: "Dodaj CTA", icon: <Megaphone size={13} weight="bold" /> },
  { action: "hashtags", label: "Hashtagi", icon: <Hash size={13} weight="bold" /> },
];

export function CampaignStudio({ initialDraft }: Props) {
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const toastIdRef = useRef(0);
  const initialSelected = buildSelectedState(initialDraft?.platforms ?? DEFAULT_PLATFORMS);
  const initialResults: Partial<Record<Platform, string>> = initialDraft?.posts ?? {};
  const initialFiles = initialDraft?.files ?? [];
  const initialSnapshot = buildSnapshot(
    initialDraft?.raw ?? DEFAULT_RAW,
    initialSelected,
    initialResults,
    initialDraft?.file_ids ?? [],
  );

  const [draftId, setDraftId] = useState(initialDraft?.id ?? null);
  const [draftTitle, setDraftTitle] = useState(initialDraft?.title ?? "");
  const [raw, setRaw] = useState(initialDraft?.raw ?? DEFAULT_RAW);
  const [selected, setSelected] = useState<Record<Platform, boolean>>(initialSelected);
  const [results, setResults] = useState<Partial<Record<Platform, string>>>(initialResults);
  const [pristineResults, setPristineResults] =
    useState<Partial<Record<Platform, string>>>(initialResults);
  const [savedSnapshot, setSavedSnapshot] = useState(initialSnapshot);
  const [copied, setCopied] = useState<Platform | null>(null);
  const [assets, setAssets] = useState<AssetPreview[]>(
    initialFiles.length > 0 ? uploadedFilesToAssets(initialFiles) : INITIAL_ASSETS,
  );
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(initialFiles);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refining, setRefining] = useState<Partial<Record<Platform, boolean>>>({});
  const [regenerating, setRegenerating] = useState<Partial<Record<Platform, boolean>>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);

  const anySelected = PLATFORM_ORDER.some((platform) => selected[platform]);
  const activePlatforms = PLATFORM_ORDER.filter((platform) => selected[platform]);
  const hasAnyContent =
    raw.trim().length > 0 ||
    uploadedFiles.length > 0 ||
    Object.values(results).some((value) => Boolean(value?.trim()));
  const hasUnsavedChanges =
    buildSnapshot(
      raw,
      selected,
      results,
      uploadedFiles.map((file) => file.id),
    ) !== savedSnapshot;

  function togglePlatform(platform: Platform) {
    setSelected((prev) => ({ ...prev, [platform]: !prev[platform] }));
  }

  function pushToast(tone: Toast["tone"], message: string) {
    toastIdRef.current += 1;
    const id = toastIdRef.current;
    setToasts((prev) => [...prev, { id, tone, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4500);
  }

  async function applyRefine(platform: Platform, action: RefineAction) {
    const current = results[platform];
    if (!current) {
      pushToast("info", "Najpierw wygeneruj treść posta.");
      return;
    }

    setRefining((prev) => ({ ...prev, [platform]: true }));
    try {
      const response = await refinePost({ platform, text: current, action });
      setResults((prev) => ({ ...prev, [platform]: response.text }));
      setPristineResults((prev) => ({ ...prev, [platform]: response.text }));
      pushToast("success", "Treść została dopracowana.");
    } catch (error) {
      pushToast("error", getApiErrorMessage(error));
    } finally {
      setRefining((prev) => ({ ...prev, [platform]: false }));
    }
  }

  async function createContent() {
    if (!anySelected) {
      pushToast("info", "Wybierz przynajmniej jedną platformę.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generatePosts({
        raw,
        platforms: activePlatforms,
        file_ids: uploadedFiles.map((file) => file.id),
      });
      setResults(response.posts);
      setPristineResults(response.posts);
      const generatedCount = Object.keys(response.posts).length;
      if (generatedCount > 0) pushToast("success", `Wygenerowano ${generatedCount} posty.`);
      for (const [platform, message] of Object.entries(response.errors)) {
        if (message) pushToast("error", `${PLATFORM_META[platform as Platform].name}: ${message}`);
      }
      if (generatedCount === 0 && Object.keys(response.errors).length === 0) {
        pushToast("error", "Backend nie zwrócił żadnej treści.");
      }
    } catch (error) {
      pushToast("error", getApiErrorMessage(error));
    } finally {
      setIsGenerating(false);
    }
  }

  async function regeneratePlatform(platform: Platform) {
    setRegenerating((prev) => ({ ...prev, [platform]: true }));
    try {
      const response = await generatePosts({
        raw,
        platforms: [platform],
        file_ids: uploadedFiles.map((file) => file.id),
      });
      const nextText = response.posts[platform];
      if (!nextText) {
        const message = response.errors[platform] ?? "Backend nie zwrócił treści dla tej platformy.";
        pushToast("error", message);
        return;
      }
      setResults((prev) => ({ ...prev, [platform]: nextText }));
      setPristineResults((prev) => ({ ...prev, [platform]: nextText }));
      pushToast("success", `${PLATFORM_META[platform].name}: wygenerowano nową wersję.`);
    } catch (error) {
      pushToast("error", getApiErrorMessage(error));
    } finally {
      setRegenerating((prev) => ({ ...prev, [platform]: false }));
    }
  }

  async function saveDraftState() {
    if (!hasAnyContent) {
      pushToast("info", "Najpierw dodaj treść lub pliki do szkicu.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        raw,
        platforms: activePlatforms,
        posts: results,
        file_ids: uploadedFiles.map((file) => file.id),
      };
      const savedDraft = draftId
        ? await updateDraft(draftId, payload)
        : await createDraft(payload);
      setDraftId(savedDraft.id);
      setDraftTitle(savedDraft.title);
      setSavedSnapshot(buildSnapshot(raw, selected, results, uploadedFiles.map((file) => file.id)));
      setPristineResults(results);
      pushToast("success", draftId ? "Szkic zaktualizowany." : "Szkic zapisany.");
    } catch (error) {
      pushToast("error", getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpload(files: FileList | null) {
    const nextFiles = Array.from(files ?? []);
    if (nextFiles.length === 0) return;

    setIsUploading(true);
    try {
      const response = await uploadFiles(nextFiles);
      setUploadedFiles((prev) => [...prev, ...response.files]);
      setAssets((prev) => {
        const nextAssets = uploadedFilesToAssets(response.files);
        return prev === INITIAL_ASSETS ? nextAssets : [...nextAssets, ...prev];
      });
      pushToast("success", `Dodano ${response.files.length} pliki.`);
    } catch (error) {
      pushToast("error", getApiErrorMessage(error));
    } finally {
      setIsUploading(false);
      if (uploadInputRef.current) uploadInputRef.current.value = "";
    }
  }

  async function copyPost(platform: Platform) {
    const text = results[platform];
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(platform);
    pushToast("success", "Post skopiowany do schowka.");
    window.setTimeout(() => setCopied(null), 1500);
  }

  function updateResult(platform: Platform, text: string) {
    setResults((prev) => ({ ...prev, [platform]: text }));
  }

  function discardPlatformChanges(platform: Platform) {
    const nextText = pristineResults[platform] ?? "";
    setResults((prev) => ({ ...prev, [platform]: nextText }));
  }

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {draftTitle || "New AI Campaign"}
          </h1>
          <p className="text-sm text-gray-500">
            Wrzuć surowe myśli i materiały. AI samo wyciąga rdzeń przekazu i pisze
            pod każdą wybraną platformę.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <div
            className={`rounded-lg border px-3 py-2 text-xs font-medium ${
              hasUnsavedChanges
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {hasUnsavedChanges ? "Masz niezapisane zmiany" : "Wszystkie zmiany zapisane"}
          </div>
          <button
            type="button"
            onClick={saveDraftState}
            disabled={isSaving || !hasAnyContent}
            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:pointer-events-none disabled:opacity-50"
          >
            {isSaving ? "Zapisuję..." : draftId ? "Zapisz zmiany" : "Zapisz szkic"}
          </button>
        </div>
      </div>

      <div>
        <StepHeader marker="1" title="Target Lock" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {PLATFORM_ORDER.map((platform) => {
            const meta = PLATFORM_META[platform];
            const isOn = selected[platform];
            return (
              <button
                key={platform}
                type="button"
                onClick={() => togglePlatform(platform)}
                className={`relative rounded-xl bg-white p-5 text-left shadow-sm transition-opacity ${
                  isOn
                    ? "border-2 border-blue-600"
                    : "border border-gray-200 opacity-60 hover:opacity-100"
                }`}
              >
                {isOn ? (
                  <div className="absolute right-4 top-4 text-blue-600">
                    <CheckCircle size={20} weight="fill" />
                  </div>
                ) : null}
                <div className="mb-4">
                  <PlatformIconBadge platform={platform} size="md" />
                </div>
                <div className="text-sm font-semibold text-gray-900">{meta.name}</div>
                <div className="mt-1 text-xs text-gray-500">{meta.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <StepHeader marker="2" title="The Brain Dump" />
        <div className="grid grid-cols-1 gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:grid-cols-2">
          <div className="flex flex-col">
            <label htmlFor="brain-dump-text" className="mb-2 text-sm font-medium text-gray-700">
              Raw Thoughts
            </label>
            <textarea
              id="brain-dump-text"
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
              className="min-h-[160px] flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Raw Media Assets ({assets.length})
              </span>
              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus size={12} /> {isUploading ? "Uploading" : "Upload"}
              </button>
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/heic,image/heif"
                multiple
                className="hidden"
                onChange={(event) => handleUpload(event.target.files)}
              />
            </div>
            <div className="grid flex-1 grid-cols-2 gap-3 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-4">
              {assets.slice(0, 4).map((asset, index) =>
                asset.kind === "image" ? (
                  <AssetThumb
                    key={asset.fileId ?? `${asset.src}-${index}`}
                    kind="image"
                    src={asset.src}
                    alt={asset.alt}
                    objectPosition={asset.objectPosition}
                  />
                ) : (
                  <AssetThumb key={`${asset.label}-${index}`} kind="meme" label={asset.label} />
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {anySelected ? (
        <div>
          <StepHeader marker="3" title="Platform Previews" />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {activePlatforms.map((platform) => {
              const meta = PLATFORM_META[platform];
              const text = results[platform] ?? "";
              const pristine = pristineResults[platform] ?? "";
              const length = text.length;
              const over = length > meta.limit;
              const hasManualChanges = text !== pristine;
              return (
                <div
                  key={platform}
                  className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/50 p-4">
                    <PlatformIconBadge platform={platform} size="sm" weight="bold" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">{meta.name}</h3>
                      <p className="text-xs text-gray-500">Target: {meta.audience}</p>
                    </div>
                    <span className={`text-xs font-medium ${over ? "text-red-500" : "text-gray-400"}`}>
                      {length} / {meta.limit}
                    </span>
                  </div>

                  <div className="flex justify-center bg-gray-50/40 p-5">
                    <PlatformPreview platform={platform} text={text} image={DEMO_IMAGE[platform]} />
                  </div>

                  <div className="border-t border-gray-100 px-5 py-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-400">
                        Editable Copy
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          hasManualChanges ? "text-amber-700" : "text-gray-400"
                        }`}
                      >
                        {hasManualChanges ? "Unsaved edit" : "Synced"}
                      </div>
                    </div>
                    <textarea
                      value={text}
                      onChange={(event) => updateResult(platform, event.target.value)}
                      placeholder="Tutaj pojawi się wygenerowany post"
                      className="min-h-[160px] w-full resize-y rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="border-t border-gray-100 px-5 py-3">
                    <div className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
                      Quick Refine
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {REFINE_ACTIONS.map(({ action, label, icon }) => (
                        <button
                          key={action}
                          type="button"
                          onClick={() => applyRefine(platform, action)}
                          disabled={isGenerating || refining[platform] || regenerating[platform]}
                          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:pointer-events-none disabled:opacity-50"
                        >
                          {icon}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-between gap-2 border-t border-gray-100 px-5 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => regeneratePlatform(platform)}
                        disabled={isGenerating || regenerating[platform]}
                        className="rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:pointer-events-none disabled:opacity-50"
                      >
                        {regenerating[platform] ? "Generuję..." : "Regenerate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => discardPlatformChanges(platform)}
                        disabled={!hasManualChanges}
                        className="rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-50"
                      >
                        Discard changes
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyPost(platform)}
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-gray-800"
                    >
                      {copied === platform ? (
                        <>
                          <Check size={14} weight="bold" /> Skopiowano
                        </>
                      ) : (
                        <>
                          <Copy size={14} weight="bold" /> Kopiuj
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={createContent}
            disabled={isGenerating}
            className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-70"
          >
            <Sparkle size={16} weight="bold" />
            {isGenerating ? "Tworzę treść posta..." : "Utwórz treść posta"}
          </button>
        </div>
      ) : null}

      <div className="fixed bottom-4 right-4 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${
              toast.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : toast.tone === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-blue-200 bg-blue-50 text-blue-800"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </>
  );
}

const DEFAULT_RAW =
  "robiłem apkę całą noc, błędy w kodzie, zjadłem pizzę, fajne uczucie";
const DEFAULT_PLATFORMS: Platform[] = ["linkedin", "instagram"];

function buildSelectedState(platforms: Platform[]): Record<Platform, boolean> {
  return {
    linkedin: platforms.includes("linkedin"),
    instagram: platforms.includes("instagram"),
    x: platforms.includes("x"),
  };
}

function uploadedFilesToAssets(files: UploadedFile[]): AssetPreview[] {
  return files.map((file) => ({
    kind: "image",
    src: file.url,
    alt: file.filename,
    fileId: file.id,
  }));
}

function buildSnapshot(
  raw: string,
  selected: Record<Platform, boolean>,
  results: Partial<Record<Platform, string>>,
  fileIds: string[],
): string {
  return JSON.stringify({
    raw,
    fileIds,
    selected: PLATFORM_ORDER.map((platform) => [platform, selected[platform]]),
    results: PLATFORM_ORDER.map((platform) => [platform, results[platform] ?? ""]),
  });
}
