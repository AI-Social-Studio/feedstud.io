"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CaretLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  CheckIcon,
  CopyIcon,
  HashIcon,
  MegaphoneIcon,
  PencilSimpleIcon,
  PlusIcon,
  ScissorsIcon,
  SmileyWinkIcon,
  SparkleIcon,
  TextAaIcon,
} from "@phosphor-icons/react/dist/ssr";
import { AssetThumb } from "@/components/ui/asset-thumb";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { PlatformIconBadge } from "@/components/ui/platform-icon-badge";
import { StepHeader } from "@/components/ui/step-header";
import type { Dictionary } from "@/dictionaries";
import { useDictionary } from "@/lib/i18n";
import { PlatformPreview } from "./platform-preview";
import { PLATFORM_META, PLATFORM_ORDER, type Platform, type RefineAction } from "./content-engine";
import { createDraft, type Draft, type UploadedFile, updateDraft } from "@/lib/drafts-api";
import {
  deleteUpload,
  generatePosts,
  getApiErrorMessage,
  refinePost,
  type GenerateResponse,
  uploadFiles,
} from "@/lib/studio-api";

const DEMO_IMAGE: Record<Platform, string | undefined> = {
  linkedin: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=640&q=80",
  instagram: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=640&q=80",
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
  initialTitle?: string;
};

type PostingSettings = {
  publishMode: "now" | "schedule";
  schedulePerPlatform: Partial<Record<Platform, string>>;
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
    { action: "hook", label: labels.hook, icon: <SparkleIcon size={13} weight="bold" /> },
    {
      action: "shorten",
      label: labels.shorten,
      icon: <ScissorsIcon size={13} weight="bold" />,
    },
    { action: "formal", label: labels.formal, icon: <TextAaIcon size={13} weight="bold" /> },
    {
      action: "casual",
      label: labels.casual,
      icon: <SmileyWinkIcon size={13} weight="bold" />,
    },
    { action: "cta", label: labels.cta, icon: <MegaphoneIcon size={13} weight="bold" /> },
    { action: "hashtags", label: labels.hashtags, icon: <HashIcon size={13} weight="bold" /> },
  ];
}

function nowDatetimeLocal(): string {
  const now = new Date();
  now.setSeconds(0, 0);
  return now.toISOString().slice(0, 16);
}

export function CampaignStudio({ initialDraft, initialTitle }: Props) {
  const dict = useDictionary();
  const refineActions = buildRefineActions(dict.studio.refineActions);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const toastIdRef = useRef(0);
  const initialSelected = buildSelectedState(initialDraft?.platforms ?? DEFAULT_PLATFORMS);
  const initialActivePlatform =
    PLATFORM_ORDER.find((platform) => initialSelected[platform]) ?? PLATFORM_ORDER[0];
  const initialResults: Partial<Record<Platform, string>> = initialDraft?.posts ?? {};
  const initialFiles = initialDraft?.files ?? [];
  const initialPostingSettings = loadPostingSettings(initialDraft?.id ?? null);
  const initialSnapshot = buildSnapshot(
    initialDraft?.title ?? "",
    initialDraft?.raw ?? DEFAULT_RAW,
    initialSelected,
    initialResults,
    initialFiles.map((file) => file.id),
    initialPostingSettings.publishMode,
    initialPostingSettings.schedulePerPlatform,
  );

  const [draftId, setDraftId] = useState(initialDraft?.id ?? null);
  const [draftTitle, setDraftTitle] = useState(initialDraft?.title ?? initialTitle ?? "");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [raw, setRaw] = useState(initialDraft?.raw ?? DEFAULT_RAW);
  const [selected, setSelected] = useState<Record<Platform, boolean>>(initialSelected);
  const [activePlatform, setActivePlatform] = useState<Platform>(initialActivePlatform);
  const [results, setResults] = useState<Partial<Record<Platform, string>>>(initialResults);
  const [pristineResults, setPristineResults] =
    useState<Partial<Record<Platform, string>>>(initialResults);
  const [publishMode, setPublishMode] = useState<"now" | "schedule">(
    initialPostingSettings.publishMode,
  );
  const [schedulePerPlatform, setSchedulePerPlatform] = useState<Partial<Record<Platform, string>>>(
    initialPostingSettings.schedulePerPlatform,
  );
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
  const uploadedFileIds = uploadedFiles.map((file) => file.id);
  const isAssetMutationLocked =
    isGenerating || isUploading || isSaving || Object.values(regenerating).some(Boolean);
  const hasAnyContent =
    raw.trim().length > 0 ||
    uploadedFiles.length > 0 ||
    Object.values(results).some((value) => Boolean(value?.trim()));

  const hasUnsavedChanges =
    buildSnapshot(
      draftTitle,
      raw,
      selected,
      results,
      uploadedFileIds,
      publishMode,
      schedulePerPlatform,
    ) !== savedSnapshot;
  const focusedPlatform = activePlatforms.includes(activePlatform)
    ? activePlatform
    : (activePlatforms[0] ?? PLATFORM_ORDER[0]);
  const focusedMeta = PLATFORM_META[focusedPlatform];
  const focusedText = results[focusedPlatform] ?? "";
  const focusedPristine = pristineResults[focusedPlatform] ?? "";
  const focusedLength = focusedText.length;
  const focusedOver = focusedLength > focusedMeta.limit;
  const hasFocusedManualChanges = focusedText !== focusedPristine;

  function togglePlatform(platform: Platform) {
    setSelected((prev) => ({ ...prev, [platform]: !prev[platform] }));
  }

  function goToAdjacentPlatform(direction: -1 | 1) {
    if (activePlatforms.length <= 1) return;
    const currentIndex = activePlatforms.indexOf(focusedPlatform);
    const nextIndex = (currentIndex + direction + activePlatforms.length) % activePlatforms.length;
    setActivePlatform(activePlatforms[nextIndex]);
  }

  function pushToast(tone: Toast["tone"], message: string) {
    toastIdRef.current += 1;
    const id = toastIdRef.current;
    setToasts((prev) => [...prev, { id, tone, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4500);
  }

  function formatGenerationError(error: GenerateResponse["errors"][Platform] | undefined) {
    if (!error) return dict.studio.toasts.noBackendContentPlatform;
    if (error.code === "invalid_model_output" || error.code === "model_empty_output") {
      return dict.studio.toasts.invalidModelOutput;
    }
    if (error.code === "content_generation_failed") {
      return dict.studio.toasts.contentGenerationFailed;
    }
    return error.detail;
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
      const hasErrors = Object.keys(response.errors).length > 0;
      if (generatedCount > 0) {
        pushToast(
          "success",
          hasErrors
            ? dict.studio.toasts.generationPartial(generatedCount)
            : dict.studio.toasts.generated(generatedCount),
        );
      }
      for (const [platform, errorInfo] of Object.entries(response.errors)) {
        if (errorInfo) {
          pushToast(
            "error",
            `${PLATFORM_META[platform as Platform].name}: ${formatGenerationError(errorInfo)}`,
          );
        }
      }
      if (generatedCount === 0 && !hasErrors) {
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
        const message = formatGenerationError(response.errors[platform]);
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
        title: draftTitle.trim() || undefined,
        raw,
        platforms: activePlatforms,
        posts: results,
        file_ids: uploadedFiles.map((file) => file.id),
      };
      const savedDraft = draftId ? await updateDraft(draftId, payload) : await createDraft(payload);
      setDraftId(savedDraft.id);
      setDraftTitle(savedDraft.title);
      savePostingSettings(savedDraft.id, { publishMode, schedulePerPlatform });
      setSavedSnapshot(
        buildSnapshot(
          savedDraft.title,
          raw,
          selected,
          results,
          uploadedFiles.map((file) => file.id),
          publishMode,
          schedulePerPlatform,
        ),
      );
      setPristineResults(results);
      pushToast(
        "success",
        draftId ? dict.studio.toasts.draftUpdated : dict.studio.toasts.draftSaved,
      );
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

  function handlePublishNow() {
    pushToast("success", dict.studio.toasts.publishQueued);
  }

  function handleSchedulePublication() {
    const missingPlatform = activePlatforms.some((platform) => !schedulePerPlatform[platform]);
    if (missingPlatform) {
      pushToast("info", dict.studio.toasts.scheduleMissingPerPost);
      return;
    }
    pushToast("success", dict.studio.toasts.scheduleReadyPerPost);
  }

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          {isEditingTitle ? (
            <input
              autoFocus
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(event) => {
                if (event.key === "Enter") setIsEditingTitle(false);
                if (event.key === "Escape") setIsEditingTitle(false);
              }}
              placeholder={dict.studio.defaultTitle}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-2xl font-bold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="group inline-flex items-center gap-2 text-left text-2xl font-bold text-gray-900 transition-colors hover:text-blue-600 dark:text-gray-50 dark:hover:text-blue-400"
            >
              <span>{draftTitle || dict.studio.defaultTitle}</span>
              <PencilSimpleIcon
                size={18}
                weight="bold"
                className="text-gray-400 transition-colors group-hover:text-blue-500 dark:text-gray-500 dark:group-hover:text-blue-400"
              />
            </button>
          )}
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          {hasUnsavedChanges ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
              {dict.studio.unsavedChanges}
            </div>
          ) : null}
          <button
            type="button"
            onClick={saveDraftState}
            disabled={isSaving || !hasAnyContent || !hasUnsavedChanges}
            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-gray-800 active:translate-y-0 disabled:pointer-events-none disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:translate-y-0 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
          >
            {isSaving
              ? dict.studio.saving
              : draftId
                ? dict.studio.saveChanges
                : dict.studio.saveDraft}
          </button>
        </div>
      </div>

      <div>
        <StepHeader marker="1" title={dict.studio.rawThoughts} />
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.95fr]">
            <div className="flex flex-col">
              <textarea
                id="brain-dump-text"
                value={raw}
                onChange={(event) => setRaw(event.target.value)}
                className="min-h-55 flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
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
                  <PlusIcon size={12} /> {isUploading ? dict.studio.uploading : dict.studio.upload}
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
              <div className="grid flex-1 grid-cols-2 gap-3 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-4 sm:grid-cols-3 dark:border-gray-700 dark:bg-gray-800/50">
                {assets.length > 0 ? (
                  assets.map((asset, index) => (
                    <AssetThumb
                      key={asset.fileId ?? `${asset.src}-${index}`}
                      kind="image"
                      src={asset.src}
                      alt={asset.alt}
                      objectPosition={asset.objectPosition}
                      onRemove={asset.fileId ? () => removeUploadedFile(asset.fileId) : undefined}
                      removeDisabled={
                        asset.fileId
                          ? removingFileIds.includes(asset.fileId) || isAssetMutationLocked
                          : false
                      }
                      removeLabel={
                        isAssetMutationLocked
                          ? dict.studio.removeFileLocked
                          : dict.studio.removeFile
                      }
                    />
                  ))
                ) : showDemoAssets ? (
                  INITIAL_ASSETS.map((asset, index) =>
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
                ) : (
                  <div className="col-span-2 flex min-h-33 flex-col items-center justify-center rounded-lg border border-gray-200 bg-white/70 px-4 text-center sm:col-span-3 dark:border-gray-700 dark:bg-gray-900/70">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {dict.studio.noFilesYet}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {dict.studio.noFilesHint}
                    </p>
                  </div>
                )}
              </div>
              {showDemoAssets && uploadedFiles.length === 0 ? (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {dict.studio.demoAssetsHint}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div>
        <StepHeader
          marker="2"
          title={dict.studio.target}
          right={
            <button
              type="button"
              onClick={createContent}
              disabled={isGenerating || !anySelected}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-px hover:bg-blue-700 hover:shadow-md active:translate-y-0 disabled:pointer-events-none disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <SparkleIcon size={16} weight="bold" />
              {isGenerating ? dict.studio.creatingPost : dict.studio.createPost}
            </button>
          }
        />
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {PLATFORM_ORDER.map((platform) => {
            const meta = PLATFORM_META[platform];
            const isOn = selected[platform];
            const isFocused = focusedPlatform === platform && isOn;
            return (
              <button
                key={platform}
                type="button"
                onClick={() => togglePlatform(platform)}
                className={`inline-flex min-w-24 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                  isOn
                    ? "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
                    : "border border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
                } ${isFocused ? "ring-2 ring-blue-500/20" : ""}`}
              >
                <PlatformIconBadge platform={platform} size="sm" weight="bold" />
                <span>{meta.name}</span>
                {isOn ? <CheckCircleIcon size={16} weight="fill" className="ml-auto" /> : null}
              </button>
            );
          })}
        </div>
      </div>

      {anySelected ? (
        <div>
          <StepHeader marker="3" title={dict.studio.step3Title} />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div
              key={`editor-${focusedPlatform}`}
              className="animate-page-in flex h-[70svh] min-h-[420px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:h-150 xl:h-180 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                {activePlatforms.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => goToAdjacentPlatform(-1)}
                    className="inline-flex size-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-blue-700 dark:hover:text-blue-400"
                    aria-label="Previous platform"
                  >
                    <CaretLeftIcon size={16} weight="bold" />
                  </button>
                ) : null}
                <PlatformIconBadge platform={focusedPlatform} size="sm" weight="bold" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {focusedMeta.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {dict.studio.target}: {dict.studio.platforms[focusedPlatform].audience}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium ${focusedOver ? "text-red-500" : "text-gray-400 dark:text-gray-500"}`}
                >
                  {focusedLength} / {focusedMeta.limit}
                </span>
                {activePlatforms.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => goToAdjacentPlatform(1)}
                    className="inline-flex size-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-blue-700 dark:hover:text-blue-400"
                    aria-label="Next platform"
                  >
                    <CaretRightIcon size={16} weight="bold" />
                  </button>
                ) : null}
              </div>

              <div className="flex-1 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-medium tracking-wider text-gray-400 uppercase dark:text-gray-500">
                    {dict.studio.editableCopy}
                  </div>
                  <div
                    className={`text-xs font-medium ${
                      hasFocusedManualChanges
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {hasFocusedManualChanges ? dict.studio.unsavedEdit : dict.studio.synced}
                  </div>
                </div>
                <textarea
                  value={focusedText}
                  onChange={(event) => updateResult(focusedPlatform, event.target.value)}
                  placeholder={dict.studio.textareaPlaceholder}
                  className="h-[calc(100%-1.75rem)] w-full resize-none overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
                <div className="mb-2 text-xs font-medium tracking-wider text-gray-400 uppercase dark:text-gray-500">
                  {dict.studio.quickRefine}
                </div>
                <div className="flex flex-wrap gap-2">
                  {refineActions.map(({ action, label, icon }) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => applyRefine(focusedPlatform, action)}
                      disabled={
                        isGenerating || refining[focusedPlatform] || regenerating[focusedPlatform]
                      }
                      className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                    >
                      {icon}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap justify-between gap-2 px-5 py-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => regeneratePlatform(focusedPlatform)}
                    disabled={isGenerating || regenerating[focusedPlatform]}
                    className="rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                  >
                    {regenerating[focusedPlatform]
                      ? dict.studio.regenerating
                      : dict.studio.regenerate}
                  </button>
                  <button
                    type="button"
                    onClick={() => discardPlatformChanges(focusedPlatform)}
                    disabled={!hasFocusedManualChanges}
                    className="rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-red-700 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  >
                    {dict.studio.discardChanges}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => copyPost(focusedPlatform)}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
                >
                  {copied === focusedPlatform ? (
                    <>
                      <CheckIcon size={14} weight="bold" /> {dict.studio.copied}
                    </>
                  ) : (
                    <>
                      <CopyIcon size={14} weight="bold" /> {dict.studio.copy}
                    </>
                  )}
                </button>
              </div>
            </div>

            <div
              key={`preview-${focusedPlatform}`}
              className="animate-page-in flex h-[70svh] min-h-105 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:h-150 xl:h-180 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <div className="text-xs font-medium tracking-wider text-gray-400 uppercase dark:text-gray-500">
                  {focusedMeta.name} preview
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-gray-50/40 p-5 dark:bg-gray-800/20">
                <div className="flex min-h-full items-start justify-center">
                  <PlatformPreview
                    platform={focusedPlatform}
                    text={focusedText}
                    images={getPreviewImages(uploadedFiles, focusedPlatform)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {anySelected ? (
        <div>
          <StepHeader marker="4" title={dict.studio.step4Title} />
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPublishMode("now")}
                className={`inline-flex items-center rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  publishMode === "now"
                    ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                    : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                }`}
              >
                {dict.studio.publishNow}
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = nowDatetimeLocal();
                  setSchedulePerPlatform(Object.fromEntries(activePlatforms.map((p) => [p, now])));
                  setPublishMode("schedule");
                }}
                className={`inline-flex items-center rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  publishMode === "schedule"
                    ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                    : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                }`}
              >
                {dict.studio.schedulePublication}
              </button>
            </div>

            {publishMode === "schedule" ? (
              <div className="mt-5 flex flex-col gap-3">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {dict.studio.scheduleDateTime}
                </div>
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  {activePlatforms.map((platform) => {
                    return (
                      <div
                        key={`schedule-${platform}`}
                        className="rounded-xl border border-gray-200 bg-gray-50/70 p-3 dark:border-gray-700 dark:bg-gray-800/40"
                      >
                        <div className="mb-2 flex items-center gap-3">
                          <PlatformIconBadge platform={platform} size="sm" weight="bold" />
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {PLATFORM_META[platform].name}
                          </div>
                        </div>
                        <DateTimePicker
                          value={schedulePerPlatform[platform] ?? ""}
                          onChange={(v) =>
                            setSchedulePerPlatform((prev) => ({ ...prev, [platform]: v }))
                          }
                          placeholder={dict.studio.scheduleDatePlaceholder}
                          timeLabel={dict.studio.scheduleTimeLabel}
                          fullWidth
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="mt-6">
              <button
                type="button"
                onClick={publishMode === "schedule" ? handleSchedulePublication : handlePublishNow}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-blue-700"
              >
                {publishMode === "schedule" ? (
                  <>
                    <MegaphoneIcon size={15} weight="bold" />
                    {dict.studio.schedulePublication}
                  </>
                ) : (
                  <>
                    <MegaphoneIcon size={15} weight="bold" />
                    {dict.studio.publish}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {typeof document !== "undefined"
        ? createPortal(
            <div className="fixed right-4 bottom-4 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
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
            </div>,
            document.body,
          )
        : null}
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
  title: string,
  raw: string,
  selected: Record<Platform, boolean>,
  results: Partial<Record<Platform, string>>,
  fileIds: string[],
  publishMode: "now" | "schedule",
  schedulePerPlatform: Partial<Record<Platform, string>>,
): string {
  return JSON.stringify({
    title,
    raw,
    fileIds,
    selected: PLATFORM_ORDER.map((platform) => [platform, selected[platform]]),
    results: PLATFORM_ORDER.map((platform) => [platform, results[platform] ?? ""]),
    publishMode,
    schedulePerPlatform: PLATFORM_ORDER.map((platform) => [
      platform,
      schedulePerPlatform[platform] ?? "",
    ]),
  });
}

const POSTING_SETTINGS_KEY_PREFIX = "draft-posting-settings:";
const DEFAULT_POSTING_SETTINGS: PostingSettings = { publishMode: "now", schedulePerPlatform: {} };

function postingSettingsKey(draftId: string) {
  return `${POSTING_SETTINGS_KEY_PREFIX}${draftId}`;
}

function savePostingSettings(draftId: string, settings: PostingSettings) {
  window.localStorage.setItem(postingSettingsKey(draftId), JSON.stringify(settings));
}

function loadPostingSettingsFromStorage(draftId: string): PostingSettings | null {
  const raw = window.localStorage.getItem(postingSettingsKey(draftId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PostingSettings;
    return {
      publishMode: parsed.publishMode === "schedule" ? "schedule" : "now",
      schedulePerPlatform: parsed.schedulePerPlatform ?? {},
    };
  } catch {
    return null;
  }
}

function loadPostingSettings(draftId: string | null): PostingSettings {
  if (!draftId || typeof window === "undefined") return DEFAULT_POSTING_SETTINGS;
  return loadPostingSettingsFromStorage(draftId) ?? DEFAULT_POSTING_SETTINGS;
}
