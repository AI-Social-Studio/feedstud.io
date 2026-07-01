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
import type { Dictionary } from "@/dictionaries";
import { useDictionary } from "@/lib/i18n";
import { PlatformPreview } from "./platform-preview";
import {
  PLATFORM_META,
  PLATFORM_ORDER,
  type Platform,
  type RefineAction,
} from "./content-engine";
import {
  createDraft,
  deleteUpload,
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

const DEMO_PREVIEW_IMAGES: Record<Platform, string[]> = {
  linkedin: DEMO_IMAGE.linkedin ? [DEMO_IMAGE.linkedin] : [],
  instagram: DEMO_IMAGE.instagram ? [DEMO_IMAGE.instagram] : [],
  x: DEMO_IMAGE.x ? [DEMO_IMAGE.x] : [],
};

type AssetPreview =
  | { kind: "image"; src: string; alt: string; objectPosition?: "top" | "center"; fileId?: string }
  | { kind: "meme"; label: string };

type UploadedAssetPreview = {
  kind: "image";
  src: string;
  alt: string;
  objectPosition?: "top" | "center";
  fileId: string;
};

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

function buildRefineActions(
  labels: Dictionary["studio"]["refineActions"],
): { action: RefineAction; label: string; icon: React.ReactNode }[] {
  return [
    { action: "hook", label: labels.hook, icon: <Sparkle size={13} weight="bold" /> },
    { action: "shorten", label: labels.shorten, icon: <Scissors size={13} weight="bold" /> },
    { action: "formal", label: labels.formal, icon: <TextAa size={13} weight="bold" /> },
    { action: "casual", label: labels.casual, icon: <SmileyWink size={13} weight="bold" /> },
    { action: "cta", label: labels.cta, icon: <Megaphone size={13} weight="bold" /> },
    { action: "hashtags", label: labels.hashtags, icon: <Hash size={13} weight="bold" /> },
  ];
}

export function CampaignStudio({ initialDraft }: Props) {
  const dict = useDictionary();
  const refineActions = buildRefineActions(dict.studio.refineActions);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const toastIdRef = useRef(0);
  const initialSelected = buildSelectedState(initialDraft?.platforms ?? DEFAULT_PLATFORMS);
  const initialResults: Partial<Record<Platform, string>> = initialDraft?.posts ?? {};
  const initialFiles = initialDraft?.files ?? [];
  const initialSnapshot = buildSnapshot(
    initialDraft?.raw ?? DEFAULT_RAW,
    initialSelected,
    initialResults,
    initialFiles.map((file) => file.id),
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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(initialFiles);
  const [showDemoAssets, setShowDemoAssets] = useState(!initialDraft && initialFiles.length === 0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [removingFileIds, setRemovingFileIds] = useState<string[]>([]);
  const [refining, setRefining] = useState<Partial<Record<Platform, boolean>>>({});
  const [regenerating, setRegenerating] = useState<Partial<Record<Platform, boolean>>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);

  const anySelected = PLATFORM_ORDER.some((platform) => selected[platform]);
  const activePlatforms = PLATFORM_ORDER.filter((platform) => selected[platform]);
  const assets = uploadedFilesToAssets(uploadedFiles);
  const isAssetMutationLocked = isGenerating || isUploading || isSaving || Object.values(regenerating).some(Boolean);
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
      pushToast("info", dict.studio.toasts.generateFirst);
      return;
    }

    setRefining((prev) => ({ ...prev, [platform]: true }));
    try {
      const response = await refinePost({ platform, text: current, action });
      setResults((prev) => ({ ...prev, [platform]: response.text }));
      setPristineResults((prev) => ({ ...prev, [platform]: response.text }));
      pushToast("success", dict.studio.toasts.refined);
    } catch (error) {
      pushToast("error", getApiErrorMessage(error));
    } finally {
      setRefining((prev) => ({ ...prev, [platform]: false }));
    }
  }

  async function createContent() {
    if (!anySelected) {
      pushToast("info", dict.studio.toasts.selectPlatform);
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
      if (generatedCount > 0) pushToast("success", dict.studio.toasts.generated(generatedCount));
      for (const [platform, message] of Object.entries(response.errors)) {
        if (message) pushToast("error", `${PLATFORM_META[platform as Platform].name}: ${message}`);
      }
      if (generatedCount === 0 && Object.keys(response.errors).length === 0) {
        pushToast("error", dict.studio.toasts.noBackendContent);
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
        const message = response.errors[platform] ?? dict.studio.toasts.noBackendContentPlatform;
        pushToast("error", message);
        return;
      }
      setResults((prev) => ({ ...prev, [platform]: nextText }));
      setPristineResults((prev) => ({ ...prev, [platform]: nextText }));
      pushToast("success", dict.studio.toasts.regenerated(PLATFORM_META[platform].name));
    } catch (error) {
      pushToast("error", getApiErrorMessage(error));
    } finally {
      setRegenerating((prev) => ({ ...prev, [platform]: false }));
    }
  }

  async function saveDraftState() {
    if (!hasAnyContent) {
      pushToast("info", dict.studio.toasts.addContentFirst);
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
      pushToast("success", draftId ? dict.studio.toasts.draftUpdated : dict.studio.toasts.draftSaved);
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
      setShowDemoAssets(false);
      setUploadedFiles((prev) => [...prev, ...response.files]);
      pushToast("success", dict.studio.toasts.filesAdded(response.files.length));
    } catch (error) {
      pushToast("error", getApiErrorMessage(error));
    } finally {
      setIsUploading(false);
      if (uploadInputRef.current) uploadInputRef.current.value = "";
    }
  }

  async function removeUploadedFile(fileId: string) {
    if (isAssetMutationLocked) {
      pushToast("info", dict.studio.toasts.waitForLock);
      return;
    }
    if (!window.confirm(dict.studio.confirmDeleteFile)) return;

    setRemovingFileIds((prev) => [...prev, fileId]);
    try {
      await deleteUpload(fileId);
      setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
      pushToast("success", dict.studio.toasts.fileDeleted);
    } catch (error) {
      pushToast("error", getApiErrorMessage(error));
    } finally {
      setRemovingFileIds((prev) => prev.filter((id) => id !== fileId));
    }
  }

  async function copyPost(platform: Platform) {
    const text = results[platform];
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(platform);
    pushToast("success", dict.studio.toasts.postCopied);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-1 dark:text-gray-50">
            {draftTitle || dict.studio.defaultTitle}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{dict.studio.subtitle}</p>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <div
            className={`rounded-lg border px-3 py-2 text-xs font-medium ${
              hasUnsavedChanges
                ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400"
                : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
            }`}
          >
            {hasUnsavedChanges ? dict.studio.unsavedChanges : dict.studio.allSaved}
          </div>
          <button
            type="button"
            onClick={saveDraftState}
            disabled={isSaving || !hasAnyContent}
            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-gray-800 hover:-translate-y-px active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
          >
            {isSaving ? dict.studio.saving : draftId ? dict.studio.saveChanges : dict.studio.saveDraft}
          </button>
        </div>
      </div>

      <div>
        <StepHeader marker="1" title={dict.studio.step1Title} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {PLATFORM_ORDER.map((platform) => {
            const meta = PLATFORM_META[platform];
            const isOn = selected[platform];
            return (
              <button
                key={platform}
                type="button"
                onClick={() => togglePlatform(platform)}
                className={`relative rounded-xl bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900 ${
                  isOn
                    ? "border-2 border-blue-600 dark:border-blue-500"
                    : "border border-gray-200 opacity-60 hover:opacity-100 dark:border-gray-800"
                }`}
              >
                {isOn ? (
                  <div className="absolute right-4 top-4 text-blue-600 dark:text-blue-400">
                    <CheckCircle size={20} weight="fill" />
                  </div>
                ) : null}
                <div className="mb-4">
                  <PlatformIconBadge platform={platform} size="md" />
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{meta.name}</div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{dict.studio.platforms[platform].subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <StepHeader marker="2" title={dict.studio.step2Title} />
        <div className="grid grid-cols-1 gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:grid-cols-2 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col">
            <label htmlFor="brain-dump-text" className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {dict.studio.rawThoughts}
            </label>
            <textarea
              id="brain-dump-text"
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
              className="min-h-[160px] flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {dict.studio.rawMediaAssets} ({uploadedFiles.length})
              </span>
              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <Plus size={12} /> {isUploading ? dict.studio.uploading : dict.studio.upload}
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
            <div className="grid flex-1 grid-cols-2 gap-3 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              {assets.length > 0
                ? assets.map((asset, index) => (
                    <AssetThumb
                      key={asset.fileId ?? `${asset.src}-${index}`}
                      kind="image"
                      src={asset.src}
                      alt={asset.alt}
                      objectPosition={asset.objectPosition}
                      onRemove={asset.fileId ? () => removeUploadedFile(asset.fileId) : undefined}
                      removeDisabled={
                        asset.fileId ? removingFileIds.includes(asset.fileId) || isAssetMutationLocked : false
                      }
                      removeLabel={
                        isAssetMutationLocked ? dict.studio.removeFileLocked : dict.studio.removeFile
                      }
                    />
                  ))
                : showDemoAssets
                  ? INITIAL_ASSETS.map((asset, index) =>
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
                    )
                  : (
                    <div className="col-span-2 flex min-h-[132px] flex-col items-center justify-center rounded-lg border border-gray-200 bg-white/70 px-4 text-center dark:border-gray-700 dark:bg-gray-900/70">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{dict.studio.noFilesYet}</p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{dict.studio.noFilesHint}</p>
                    </div>
                  )}
            </div>
            {showDemoAssets && uploadedFiles.length === 0 ? (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{dict.studio.demoAssetsHint}</p>
            ) : null}
          </div>
        </div>
      </div>

      {anySelected ? (
        <div>
          <StepHeader marker="3" title={dict.studio.step3Title} />
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
                  className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                    <PlatformIconBadge platform={platform} size="sm" weight="bold" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{meta.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {dict.studio.target}: {dict.studio.platforms[platform].audience}
                      </p>
                    </div>
                    <span className={`text-xs font-medium ${over ? "text-red-500" : "text-gray-400 dark:text-gray-500"}`}>
                      {length} / {meta.limit}
                    </span>
                  </div>

                  <div className="flex justify-center bg-gray-50/40 p-5 dark:bg-gray-800/20">
                    <PlatformPreview
                      platform={platform}
                      text={text}
                      images={getPreviewImages(uploadedFiles, platform)}
                    />
                  </div>

                  <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-800">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        {dict.studio.editableCopy}
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          hasManualChanges ? "text-amber-700 dark:text-amber-400" : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {hasManualChanges ? dict.studio.unsavedEdit : dict.studio.synced}
                      </div>
                    </div>
                    <textarea
                      value={text}
                      onChange={(event) => updateResult(platform, event.target.value)}
                      placeholder={dict.studio.textareaPlaceholder}
                      className="min-h-[160px] w-full resize-y rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>

                  <div className="border-t border-gray-100 px-5 py-3 dark:border-gray-800">
                    <div className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      {dict.studio.quickRefine}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {refineActions.map(({ action, label, icon }) => (
                        <button
                          key={action}
                          type="button"
                          onClick={() => applyRefine(platform, action)}
                          disabled={isGenerating || refining[platform] || regenerating[platform]}
                          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                        >
                          {icon}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-between gap-2 border-t border-gray-100 px-5 py-3 dark:border-gray-800">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => regeneratePlatform(platform)}
                        disabled={isGenerating || regenerating[platform]}
                        className="rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                      >
                        {regenerating[platform] ? dict.studio.regenerating : dict.studio.regenerate}
                      </button>
                      <button
                        type="button"
                        onClick={() => discardPlatformChanges(platform)}
                        disabled={!hasManualChanges}
                        className="rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-red-700 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      >
                        {dict.studio.discardChanges}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyPost(platform)}
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
                    >
                      {copied === platform ? (
                        <>
                          <Check size={14} weight="bold" /> {dict.studio.copied}
                        </>
                      ) : (
                        <>
                          <Copy size={14} weight="bold" /> {dict.studio.copy}
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
            className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-blue-700 hover:-translate-y-px hover:shadow-md active:translate-y-0 disabled:pointer-events-none disabled:opacity-70 disabled:hover:translate-y-0"
          >
            <Sparkle size={16} weight="bold" />
            {isGenerating ? dict.studio.creatingPost : dict.studio.createPost}
          </button>
        </div>
      ) : null}

      <div className="fixed bottom-4 right-4 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${
              toast.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950 dark:text-emerald-300"
                : toast.tone === "error"
                  ? "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-950 dark:text-red-300"
                  : "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/30 dark:bg-blue-950 dark:text-blue-300"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </>
  );
}

const DEFAULT_RAW = "";
const DEFAULT_PLATFORMS: Platform[] = ["linkedin", "instagram"];

function buildSelectedState(platforms: Platform[]): Record<Platform, boolean> {
  return {
    linkedin: platforms.includes("linkedin"),
    instagram: platforms.includes("instagram"),
    x: platforms.includes("x"),
  };
}

function uploadedFilesToAssets(files: UploadedFile[]): UploadedAssetPreview[] {
  return files.map((file) => ({
    kind: "image",
    src: file.url,
    alt: file.filename,
    fileId: file.id,
  }));
}

function getPreviewImages(files: UploadedFile[], platform: Platform): string[] {
  return files.length > 0 ? files.map((file) => file.url) : DEMO_PREVIEW_IMAGES[platform];
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
