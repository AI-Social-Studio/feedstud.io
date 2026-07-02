export type LegalSection = {
  heading: string;
  body: string | string[];
};

export type LegalDoc = {
  title: string;
  updatedDate: string;
  intro: string;
  sections: LegalSection[];
};

export type Dictionary = {
  common: {
    signIn: string;
    tryItFree: string;
    goToDashboard: string;
    switchToDark: string;
    switchToLight: string;
    darkTheme: string;
    lightTheme: string;
    cancel: string;
    createCampaign: string;
    campaignNamePromptTitle: string;
    campaignNamePromptDescription: string;
    campaignNameLabel: string;
    campaignNamePlaceholder: string;
  };
  hero: {
    headline: string;
    subtitle: string;
    cta: string;
  };
  howItWorks: {
    eyebrow: string;
    title: string;
    steps: { title: string; description: string }[];
  };
  features: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: { title: string; description: string }[];
  };
  platforms: {
    eyebrow: string;
    title: string;
    subtitle: string;
    exampleLabel: string;
    items: { tagline: string; traits: string[]; example: string }[];
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
  };
  footer: {
    tagline: string;
    columns: { title: string; links: { label: string; href: string }[] }[];
    copyrightSuffix: string;
  };
  legal: {
    lastUpdated: string;
    contactHeading: string;
    contactBody: string;
    contactLinkText: string;
    privacy: LegalDoc;
    terms: LegalDoc;
    contact: {
      title: string;
      description: string;
    };
  };
  nav: {
    mainMenu: string;
    home: string;
    myCampaigns: string;
    newCampaign: string;
    draft: string;
    adminSection: string;
    admin: string;
  };
  home: {
    title: string;
    subtitle: string;
    newCampaign: string;
    statLast7: string;
    statLast30: string;
    statTotal: string;
    recentCampaigns: string;
    viewAll: string;
    emptyState: string;
    noDescription: string;
  };
  myCampaigns: {
    title: string;
    subtitle: string;
    newCampaign: string;
    searchPlaceholder: string;
    sortNewest: string;
    sortOldest: string;
    emptyState: string;
    noResults: string;
    noDescription: string;
    version: string;
    versions: string;
  };
  adminTelemetry: {
    badge: string;
    title: string;
    subtitle: string;
    viewingAs: string;
    filters: {
      kind: string;
      status: string;
      platform: string;
      model: string;
      userId: string;
      limit: string;
      apply: string;
      reset: string;
      all: string;
      placeholders: {
        model: string;
        userId: string;
        limit: string;
      };
      options: {
        kind: {
          generate: string;
          refine: string;
        };
        status: {
          success: string;
          error: string;
        };
        platform: {
          linkedin: string;
          instagram: string;
          x: string;
        };
      };
    };
    kpis: {
      totalCost: string;
      totalTokens: string;
      errorRate: string;
      averageCostPerRequest: string;
      requests: string;
      tokenHint: string;
      errorHint: string;
      reasoningTokens: string;
    };
    table: {
      title: string;
      time: string;
      kind: string;
      user: string;
      model: string;
      tokens: string;
      cost: string;
      status: string;
      noResults: string;
      anonymous: string;
    };
    detail: {
      empty: string;
      title: string;
      user: string;
      model: string;
      cost: string;
      tokens: string;
      systemPrompt: string;
      userPrompt: string;
      responseText: string;
      reasoning: string;
      messages: string;
      usage: string;
      providerResponses: string;
      rawCompletionResponse: string;
      rawGenerationResponse: string;
      rawError: string;
      anonymous: string;
    };
  };
  studio: {
    defaultTitle: string;
    subtitle: string;
    unsavedChanges: string;
    allSaved: string;
    saving: string;
    saveChanges: string;
    saveDraft: string;
    step1Title: string;
    step2Title: string;
    step3Title: string;
    rawThoughts: string;
    rawMediaAssets: string;
    upload: string;
    uploading: string;
    noFilesYet: string;
    noFilesHint: string;
    demoAssetsHint: string;
    target: string;
    editableCopy: string;
    unsavedEdit: string;
    synced: string;
    textareaPlaceholder: string;
    quickRefine: string;
    refineActions: {
      hook: string;
      shorten: string;
      formal: string;
      casual: string;
      cta: string;
      hashtags: string;
    };
    regenerate: string;
    regenerating: string;
    discardChanges: string;
    copy: string;
    copied: string;
    createPost: string;
    creatingPost: string;
    removeFile: string;
    removeFileLocked: string;
    confirmDeleteFile: string;
    toasts: {
      selectPlatform: string;
      generateFirst: string;
      refined: string;
      generated: (count: number) => string;
      generationPartial: (count: number) => string;
      noBackendContent: string;
      noBackendContentPlatform: string;
      invalidModelOutput: string;
      contentGenerationFailed: string;
      regenerated: (platformName: string) => string;
      addContentFirst: string;
      draftUpdated: string;
      draftSaved: string;
      filesAdded: (count: number) => string;
      waitForLock: string;
      fileDeleted: string;
      postCopied: string;
    };
    platforms: {
      linkedin: { subtitle: string; audience: string };
      instagram: { subtitle: string; audience: string };
      x: { subtitle: string; audience: string };
    };
  };
};
