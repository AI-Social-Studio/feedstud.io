import type { Dictionary } from "./types";

export const pl: Dictionary = {
  common: {
    signIn: "Zaloguj się",
    tryItFree: "Wypróbuj za darmo",
    goToDashboard: "Przejdź do panelu",
    switchToDark: "Włącz ciemny motyw",
    switchToLight: "Włącz jasny motyw",
    darkTheme: "Ciemny motyw",
    lightTheme: "Jasny motyw",
    cancel: "Anuluj",
    createCampaign: "Utwórz kampanię",
    campaignNamePromptTitle: "Nadaj nazwę kampanii",
    campaignNamePromptDescription: "Wpisz nazwę kampanii, zanim zaczniesz tworzyć szkic.",
    campaignNameLabel: "Nazwa kampanii",
    campaignNamePlaceholder: "np. premiera produktu na LinkedIn",
  },
  hero: {
    headline: "Najmądrzejszy sposób na tworzenie treści.",
    subtitle:
      "Wklej swoje surowe pomysły. Wybierz platformę. Otrzymaj gotowy post — dopasowany do LinkedIn, Instagrama lub X, z właściwym tonem i formatem.",
    cta: "Zacznij tworzyć",
  },
  howItWorks: {
    eyebrow: "jak to działa",
    title: "Od surowych pomysłów do gotowego posta w kilka sekund.",
    steps: [
      {
        title: "Wrzuć swoje surowe treści",
        description:
          "Wklej notatki, szkic wpisu na bloga, transkrypcję, punkty — cokolwiek. Nie musisz niczego wcześniej formatować.",
      },
      {
        title: "Wybierz platformę",
        description:
          "Wybierz LinkedIn, Instagram lub X. AI zna zasady danej platformy i automatycznie dopasowuje ton oraz strukturę.",
      },
      {
        title: "Skopiuj i opublikuj",
        description:
          "Twój gotowy, natywny dla danej platformy post czeka na Ciebie. Jedno kliknięcie kopiuje go. Bez żadnej edycji.",
      },
    ],
  },
  features: {
    eyebrow: "funkcje",
    title: "Stworzone, by wyeliminować żmudną pracę.",
    subtitle:
      "Osoby pracujące ze słowem toną w przeformatowywaniu treści. Feedstud.io robi za Ciebie tę mechaniczną robotę, żebyś mógł skupić się na pomysłach.",
    items: [
      {
        title: "AI świadome platformy",
        description:
          "LinkedIn dostaje rzeczowy, wartościowy tekst. Instagram — wizualną narrację z hashtagami. X — mocne hooki poniżej 280 znaków. AI zna różnicę.",
      },
      {
        title: "Jedna generacja, gotowa do publikacji",
        description:
          "Bez inżynierii promptów, bez przerzucania się wiadomościami. Wklej treść, wybierz platformę, a wynik jest gotowy — nie szkic.",
      },
      {
        title: "Godziny oszczędności co tydzień",
        description:
          "Zespoły contentowe spędzają 3–5 godzin tygodniowo na ręcznym przeformatowywaniu tych samych pomysłów na różne kanały. Feedstud.io skraca to do kilku sekund.",
      },
      {
        title: "Spójny głos marki",
        description:
          "Ton dopasowuje się do platformy, a nie do nastroju AI. Twój przekaz pozostaje spójny — czy trafia na LinkedIn, czy na X.",
      },
    ],
  },
  platforms: {
    eyebrow: "obsługiwane platformy",
    title: "Jeden pomysł. Trzy odbiorców. Zero dodatkowej pracy.",
    subtitle: "Każda platforma ma swoją gramatykę. Feedstud.io mówi płynnie we wszystkich trzech.",
    exampleLabel: "przykładowy wynik",
    items: [
      {
        tagline: "Profesjonalnie · B2B · Przywództwo myślowe",
        traits: [
          "Hooki oparte na wartości",
          "Podział na akapity",
          "Bez spamu hashtagami",
          "Autorytet w pierwszej osobie",
        ],
        example:
          "Większość zespołów traci 3 godziny tygodniowo na przeformatowywanie treści. Oto jak skróciliśmy to do 30 sekund…",
      },
      {
        tagline: "Wizualnie · Lifestyle · Społeczność",
        traits: [
          "Dużo emoji",
          "Krótkie, mocne zdania",
          "Blok hashtagów",
          "Bliski, autentyczny ton",
        ],
        example:
          "Wyobraź sobie, że 30 sekund zajmuje to, co kiedyś trwało godzinami ✨ To zmieniło wszystko w naszym zespole →",
      },
      {
        tagline: "Krótka forma · Trendy · Bezpośrednio",
        traits: ["Poniżej 280 znaków", "Mocny hook na start", "Bez lania wody", "Konwersacyjnie"],
        example: "Zabiliśmy 3 godziny cotygodniowej żmudnej pracy jednym narzędziem. Oto jak:",
      },
    ],
  },
  cta: {
    title: "Przestań przeformatowywać. Zacznij publikować.",
    subtitle:
      "Twoje pomysły są już dobre. Feedstud.io po prostu dopasowuje je tam, gdzie muszą trafić.",
    button: "Zacznij tworzyć",
  },
  footer: {
    tagline:
      "Zautomatyzowane dopasowanie treści przez AI. Wklej swoje pomysły, wybierz platformę, otrzymaj gotowy post.",
    columns: [
      {
        title: "Produkt",
        links: [
          { label: "Jak to działa", href: "/#how-it-works" },
          { label: "Funkcje", href: "/#features" },
          { label: "Platformy", href: "/#platforms" },
        ],
      },
      {
        title: "Firma",
        links: [
          { label: "Kontakt", href: "/contact" },
          { label: "Autorzy", href: "/authors" },
        ],
      },
      {
        title: "Prawne",
        links: [
          { label: "Polityka prywatności", href: "/privacy" },
          { label: "Regulamin", href: "/terms" },
        ],
      },
    ],
    copyrightSuffix: "feedstud.io — zautomatyzowane dopasowanie treści przez AI.",
  },
  legal: {
    lastUpdated: "Ostatnia aktualizacja",
    contactHeading: "Kontakt",
    contactBody: "Masz pytania? Napisz przez",
    contactLinkText: "stronę kontaktową",
    privacy: {
      title: "Polityka prywatności",
      updatedDate: "1 lipca 2026",
      intro:
        'Niniejsza Polityka prywatności wyjaśnia, jakie informacje feedstud.io ("my") zbiera podczas korzystania z aplikacji oraz w jaki sposób są one wykorzystywane.',
      sections: [
        {
          heading: "Jakie informacje zbieramy",
          body: [
            "Dane konta (imię, adres e-mail) podane przy rejestracji.",
            "Treści, które wklejasz lub przesyłasz — surowe notatki, pliki i obrazy — do generowania postów.",
            "Posty i szkice wygenerowane lub zapisane w aplikacji.",
            "Podstawowe dane o użytkowaniu (odwiedzane strony, wykonane akcje), które pomagają nam utrzymać niezawodne działanie aplikacji.",
          ],
        },
        {
          heading: "Jak wykorzystujemy Twoje dane",
          body: "Wykorzystujemy dostarczoną przez Ciebie treść do generowania postów dopasowanych do platform przez naszego dostawcę AI, do zapisywania i wyświetlania Twoich szkiców oraz do prowadzenia i ulepszania aplikacji. Nie sprzedajemy Twoich danych.",
        },
        {
          heading: "Usługi zewnętrzne",
          body: [
            "Uwierzytelnianie obsługuje Clerk.",
            "Generowanie postów obsługuje nasz dostawca AI, który przetwarza przesłany przez Ciebie tekst i pliki.",
            "Przesłane pliki przechowywane są w naszym magazynie obiektów.",
          ],
        },
        {
          heading: "Przechowywanie danych",
          body: "Szkice, wygenerowane posty i przesłane pliki są przechowywane do momentu ich usunięcia lub zamknięcia konta. W dowolnym momencie możesz usunąć pojedyncze szkice i pliki bezpośrednio w aplikacji.",
        },
        {
          heading: "Twoje prawa",
          body: "W dowolnym momencie możesz poprosić o dostęp do swoich danych osobowych, ich poprawienie lub usunięcie, kontaktując się z nami.",
        },
      ],
    },
    terms: {
      title: "Regulamin",
      updatedDate: "1 lipca 2026",
      intro:
        "Niniejszy Regulamin określa zasady korzystania z feedstud.io. Zakładając konto lub korzystając z aplikacji, akceptujesz ten regulamin.",
      sections: [
        {
          heading: "Korzystanie z usługi",
          body: "Odpowiadasz za treści, które wklejasz, przesyłasz lub generujesz w aplikacji, oraz za bezpieczeństwo danych logowania do konta. Nie używaj feedstud.io do generowania treści, które są nielegalne, obraźliwe lub naruszają czyjeś prawa.",
        },
        {
          heading: "Twoje treści",
          body: "Zachowujesz prawa własności do przesłanej treści oraz wygenerowanych dla Ciebie postów. Wykorzystujemy je wyłącznie do świadczenia usługi — generowania, podglądu i przechowywania Twoich szkiców.",
        },
        {
          heading: "Treści generowane przez AI",
          body: "Posty generowane są automatycznie przez model AI. Nie gwarantujemy, że wygenerowana treść jest dokładna, kompletna lub odpowiednia do każdego zastosowania — zawsze przejrzyj post przed publikacją.",
        },
        {
          heading: "Dostępność",
          body: "Dążymy do tego, by aplikacja była dostępna i niezawodna, ale nie gwarantujemy nieprzerwanego dostępu i możemy okresowo modyfikować lub wstrzymywać działanie usługi.",
        },
        {
          heading: "Ograniczenie odpowiedzialności",
          body: 'feedstud.io jest dostarczane w stanie "takim, jaki jest". W zakresie dozwolonym przez prawo nie ponosimy odpowiedzialności za szkody wynikające z korzystania z wygenerowanej treści lub usługi.',
        },
        {
          heading: "Zmiany regulaminu",
          body: "Możemy okresowo aktualizować niniejszy regulamin. Dalsze korzystanie z aplikacji po zmianach oznacza akceptację nowej wersji regulaminu.",
        },
      ],
    },
    contact: {
      title: "Kontakt",
      description:
        "Masz pytania, uwagi albo coś nie działa tak, jak powinno? Napisz do nas e-mail, a odpowiemy najszybciej jak to możliwe.",
    },
  },
  authors: {
    title: "Autorzy",
    subtitle: "Poznaj zespół, który tworzy feedstud.io.",
    cofounders: "Współzałożyciele",
    roles: {
      norbert: "Full-stack Developer",
      bartlomiej: "UI/UX Designer & Frontend Developer",
      szymon: "Backend Engineer",
    },
    visitWebsite: "Odwiedź stronę",
    githubProfile: "Profil GitHub",
    linkedinProfile: "Profil LinkedIn",
  },
  nav: {
    mainMenu: "Menu główne",
    home: "Główna",
    myCampaigns: "Moje kampanie",
    newCampaign: "Nowa kampania",
    draft: "Szkic",
    adminSection: "Administracja",
    admin: "Panel administratora",
    profile: "Profil AI",
  },
  home: {
    title: "Główna",
    subtitle: "Twój przegląd aktywności w feedstud.io.",
    newCampaign: "Nowa kampania",
    statLast7: "Ostatnie 7 dni",
    statLast30: "Ostatnie 30 dni",
    statTotal: "Wszystkie kampanie",
    recentCampaigns: "Ostatnie kampanie",
    viewAll: "Zobacz wszystkie",
    emptyState: "Nie masz jeszcze żadnych kampanii. Zacznij od nowej kampanii powyżej.",
    noDescription: "Brak opisu",
  },
  myCampaigns: {
    title: "Moje kampanie",
    subtitle: "Wróć do zapisanych szkiców i otwórz je ponownie w studio.",
    newCampaign: "Nowa kampania",
    searchPlaceholder: "Szukaj kampanii po tytule lub notatkach...",
    sortNewest: "Od najnowszych",
    sortOldest: "Od najstarszych",
    emptyState: "Nie masz jeszcze żadnych zapisanych szkiców.",
    noResults: "Brak kampanii pasujących do wyszukiwania.",
    noDescription: "Brak opisu",
    version: "wersja",
    versions: "wersje",
  },
  adminTelemetry: {
    badge: "Telemetry administratora",
    title: "Panel użycia OpenRoutera",
    subtitle:
      "Sprawdzaj payloady promptów i odpowiedzi, analizuj zużycie tokenów oraz monitoruj koszt żądań AI zebranych przez zaufany frontend proxy.",
    viewingAs: "Przeglądasz jako {user}",
    filters: {
      kind: "Typ",
      status: "Status",
      platform: "Platforma",
      model: "Model",
      userId: "ID użytkownika",
      limit: "Wyniki",
      from: "Od",
      to: "Do",
      apply: "Zastosuj filtry",
      reset: "Resetuj",
      all: "Wszystkie",
      placeholders: {
        model: "gpt-oss-120b",
        userId: "user_...",
        limit: "25",
        from: "Data początkowa",
        to: "Data końcowa",
      },
      options: {
        kind: {
          generate: "Generowanie",
          refine: "Dopracowanie",
        },
        status: {
          success: "Sukces",
          error: "Błąd",
        },
        platform: {
          linkedin: "LinkedIn",
          instagram: "Instagram",
          x: "X",
        },
        limit: {
          show25: "25 wyników",
          show50: "50 wyników",
          show100: "100 wyników",
          show200: "200 wyników",
        },
      },
    },
    kpis: {
      totalCost: "Łączny koszt",
      totalTokens: "Łączne tokeny",
      errorRate: "Wskaźnik błędów",
      averageCostPerRequest: "Śr. koszt / żądanie",
      requests: "{count} żądań",
      tokenHint: "{prompt} tokenów wejściowych / {completion} tokenów wyjściowych",
      errorHint: "{failed} błędnych / {successful} udanych",
      reasoningTokens: "{count} tokenów rozumowania",
      dateRange: "{from} – {to}",
      allTime: "Cały okres",
    },
    costByModel: {
      title: "Koszt wg modelu",
      loadedPageOnly: "Tylko załadowana strona",
      model: "Model",
      requests: "Żądania",
      tokens: "Tokeny",
      cost: "Koszt",
      share: "Udział",
      noData: "Brak danych o wykonaniach.",
    },
    costChart: {
      title: "Koszt dzienny",
      loadedPageOnly: "Tylko załadowana strona",
      noData: "Brak danych o kosztach w tym okresie.",
    },
    exportCsv: "Eksportuj CSV",
    table: {
      title: "Ostatnie wykonania",
      time: "Czas",
      kind: "Typ",
      platform: "Platforma",
      action: "Akcja",
      user: "Użytkownik",
      model: "Model",
      tokens: "Tokeny",
      cost: "Koszt",
      status: "Status",
      details: "Szczegóły",
      openDetails: "Otwórz",
      openSelected: "Otwarte",
      noResults: "Żadne wykonania AI nie pasują do bieżących filtrów.",
      anonymous: "Anonimowy",
      sortAsc: "Sortuj rosnąco",
      sortDesc: "Sortuj malejąco",
      sortClear: "Wyczyść sortowanie",
    },
    detail: {
      empty:
        "Wybierz wykonanie, aby sprawdzić prompt, odpowiedź, usage i surowe payloady OpenRoutera.",
      title: "Szczegóły wykonania",
      subtitle: "Rozszerzone dane diagnostyczne i pełne payloady dla wybranego wykonania.",
      close: "Zamknij szczegóły",
      previewBadge: "Podgląd rekordu",
      traceLabel: "Trace",
      executionId: "Execution ID",
      user: "Użytkownik",
      model: "Model",
      cost: "Koszt",
      tokens: "Tokeny",
      createdAt: "Utworzono",
      provider: "Dostawca",
      platform: "Platforma",
      action: "Akcja",
      latency: "Opóźnienie",
      generationTime: "Czas generacji",
      finishReason: "Powód zakończenia",
      requestId: "Request ID",
      generationId: "Generation ID",
      upstreamId: "Upstream ID",
      inputPrompt: "Prompt wejściowy",
      inputPromptHint:
        "Treść, którą aplikacja przekazała do modelu jako właściwe wejście użytkownika.",
      modelOutput: "Wyjście modelu",
      modelOutputHint: "Końcowa odpowiedź modelu lub komunikat błędu zwrócony dla tego wykonania.",
      promptTokens: "Tokeny promptu",
      completionTokens: "Tokeny completion",
      cachedTokens: "Tokeny cache",
      reasoningTokens: "Tokeny rozumowania",
      totalUpstreamCost: "Koszt upstream",
      copy: "Kopiuj",
      copied: "Skopiowano",
      tabs: {
        overview: "Przegląd",
        prompts: "Prompty",
        payloads: "Payloady",
      },
      systemPrompt: "Prompt systemowy",
      userPrompt: "Prompt użytkownika",
      responseText: "Tekst odpowiedzi",
      reasoning: "Tok rozumowania",
      messages: "Wiadomości",
      usage: "Zużycie",
      providerResponses: "Odpowiedzi dostawcy",
      rawCompletionResponse: "Surowa odpowiedź completion",
      rawGenerationResponse: "Surowa odpowiedź generation",
      rawError: "Surowy błąd",
      anonymous: "Anonimowy",
    },
  },
  studio: {
    defaultTitle: "Nowa kampania AI",
    subtitle:
      "Wrzuć surowe myśli i materiały. AI samo wyciąga rdzeń przekazu i pisze pod każdą wybraną platformę.",
    unsavedChanges: "Masz niezapisane zmiany",
    allSaved: "Wszystkie zmiany zapisane",
    saving: "Zapisuję...",
    saveChanges: "Zapisz zmiany",
    saveDraft: "Zapisz szkic",
    step1Title: "Namierz cel",
    step2Title: "Zrzut myśli",
    step3Title: "Podgląd platform",
    step4Title: "Postowanie",
    rawThoughts: "Surowe myśli",
    rawMediaAssets: "Surowe materiały",
    upload: "Dodaj",
    uploading: "Wysyłam",
    noFilesYet: "Nie masz jeszcze wrzuconych plików",
    noFilesHint: "Dodaj obrazki, żeby AI mogło wykorzystać je przy generowaniu posta.",
    demoAssetsHint:
      "Powyżej widzisz przykładowe assety. Po pierwszym uploadzie znikną z tego widoku.",
    target: "Cel",
    editableCopy: "Edytowalna treść",
    unsavedEdit: "Niezapisana zmiana",
    synced: "Zsynchronizowano",
    textareaPlaceholder: "Tutaj pojawi się wygenerowany post",
    quickRefine: "Szybkie dopracowanie",
    refineActions: {
      hook: "Zmień hook",
      shorten: "Skróć",
      formal: "Bardziej formalnie",
      casual: "Luźniej",
      cta: "Dodaj CTA",
      hashtags: "Hashtagi",
    },
    regenerate: "Wygeneruj ponownie",
    regenerating: "Generuję...",
    discardChanges: "Odrzuć zmiany",
    copy: "Kopiuj",
    copied: "Skopiowano",
    createPost: "Utwórz treść posta",
    creatingPost: "Tworzę treść posta...",
    publish: "Opublikuj",
    publishNow: "Opublikuj teraz",
    schedulePublication: "Zaplanuj publikację",
    scheduleNow: "Teraz",
    scheduleDatePlaceholder: "Wybierz datę i godzinę",
    scheduleTimeLabel: "Godzina",
    scheduleForAll: "Jedna data dla wszystkich",
    schedulePerPost: "Osobno dla każdego posta",
    scheduleDateTime: "Data i godzina publikacji",
    scheduleHelp:
      "Ustaw jedną datę dla wszystkich postów albo osobne terminy dla każdej platformy.",
    scheduleEmpty: "Wybierz datę i godzinę, aby przygotować publikację.",
    removeFile: "Usuń plik",
    removeFileLocked: "Usuwanie zablokowane podczas generowania lub zapisu",
    confirmDeleteFile: "Usunąć ten plik na stałe z draftu i backendu?",
    toasts: {
      selectPlatform: "Wybierz przynajmniej jedną platformę.",
      generateFirst: "Najpierw wygeneruj treść posta.",
      refined: "Treść została dopracowana.",
      generated: (count) => {
        if (count === 1) return "Wygenerowano 1 post.";
        if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20))
          return `Wygenerowano ${count} posty.`;
        return `Wygenerowano ${count} postów.`;
      },
      generationPartial: (count) => {
        if (count === 1)
          return "Wygenerowano 1 post. Niektóre platformy wymagają ponowienia próby.";
        if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
          return `Wygenerowano ${count} posty. Niektóre platformy wymagają ponowienia próby.`;
        }
        return `Wygenerowano ${count} postów. Niektóre platformy wymagają ponowienia próby.`;
      },
      noBackendContent: "Backend nie zwrócił żadnej treści.",
      noBackendContentPlatform: "Backend nie zwrócił treści dla tej platformy.",
      invalidModelOutput: "Model zwrócił nieprawidłowy format odpowiedzi. Spróbuj ponownie.",
      contentGenerationFailed: "Nie udało się wygenerować treści. Spróbuj ponownie.",
      regenerated: (platformName) => `${platformName}: wygenerowano nową wersję.`,
      addContentFirst: "Najpierw dodaj treść lub pliki do szkicu.",
      draftUpdated: "Szkic zaktualizowany.",
      draftSaved: "Szkic zapisany.",
      filesAdded: (count) => {
        if (count === 1) return "Dodano 1 plik.";
        if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20))
          return `Dodano ${count} pliki.`;
        return `Dodano ${count} plików.`;
      },
      waitForLock: "Poczekaj aż zakończy się generowanie lub zapis.",
      fileDeleted: "Plik został usunięty.",
      postCopied: "Post skopiowany do schowka.",
      publishQueued:
        "Publikacja została przygotowana. Backend posting flow dodamy w następnym kroku.",
      scheduleMissingAll: "Ustaw datę i godzinę publikacji dla wszystkich postów.",
      scheduleMissingPerPost: "Ustaw datę i godzinę dla każdego zaznaczonego posta.",
      scheduleReadyAll: "Termin publikacji ustawiony dla wszystkich zaznaczonych postów.",
      scheduleReadyPerPost: "Terminy publikacji ustawione per platforma.",
    },
    platforms: {
      linkedin: { subtitle: "B2B, profesjonalnie, networking", audience: "Profesjonaliści tech" },
      instagram: {
        subtitle: "Wizualnie, lifestyle, zaangażowanie",
        audience: "Lifestyle i klimat",
      },
      x: { subtitle: "Krótka forma, newsy, trendy", audience: "Szybki feed, przegląd na szybko" },
    },
  },
  onboarding: {
    header: {
      title: "Personalizacja profilu",
      stepXofY: (step, total) => `Krok ${step} z ${total}`,
    },
    steps: {
      identity: "Tożsamość",
      audience: "Odbiorcy",
      goals: "Cele",
    },
    navigation: {
      skip: "Pomiń na razie",
      back: "Wstecz",
      next: "Dalej",
      finish: "Zakończ",
    },
    blockA: {
      titleIdentity: "Kim jesteś?",
      subtitleIdentity: "Wybierz opcję, która najlepiej opisuje Twój obecny status.",
      profiles: {
        student: { label: "Uczę się / studiuję", description: "" },
        employee: { label: "Pracuję na etacie", description: "Chcę być bardziej widoczny/a" },
        business_owner: {
          label: "Prowadzę własną firmę",
          description: "Lub działalność gospodarczą",
        },
        creator: { label: "Jestem twórcą", description: "Tworzę treści w internecie" },
        job_seeker: { label: "Szukam pracy", description: "Lub zmieniam branżę" },
        ngo: {
          label: "Działam społecznie",
          description: "W organizacjach charytatywnych lub fundacjach",
        },
        hobbyist: { label: "Rozwijam pasję", description: "Dzielę się swoim hobby" },
        other: { label: "Coś innego", description: "" },
      },
      otherIdentityLabel: "Napisz kim jesteś",
      otherIdentityPlaceholder: "Np. instruktor jogi, radca prawny...",
      titleTags: "Czym się zajmujesz?",
      subtitleTags: "Wpisz słowa kluczowe (np. marketing). Naciśnij Enter, aby dodać.",
      tagsPlaceholderEmpty: "Np. sport...",
      tagsPlaceholderMore: "Dodaj kolejne...",
      charLimit: (current, max) => `${current}/${max}`,
      tagLimit: (current, max) => `${current}/${max}`,
      removeTagLabel: (tag) => `Usuń ${tag}`,
    },
    blockB: {
      titlePlatforms: "Gdzie chcesz publikować?",
      subtitlePlatforms: "Możesz wybrać kilka opcji.",
      platforms: {
        linkedin: "LinkedIn",
        instagram: "Instagram",
        x: "X / Twitter",
        unknown: "Jeszcze nie wiem",
      },
      titleAudience: "Kto ma Cię czytać?",
      subtitleAudience: "Do kogo chcesz dotrzeć ze swoimi treściami? (Możesz wybrać kilka)",
      audiences: {
        employers: "Przyszli pracodawcy / zleceniodawcy",
        same_interests: "Osoby o podobnych zainteresowaniach",
        friends: "Moi znajomi i otoczenie",
        customers: "Klienci na moje usługi/produkty",
        broad_reach: "Jak najszersza publiczność",
        other: "Własna grupa / społeczność",
      },
      otherAudienceLabel: "Napisz do kogo chcesz docierać",
      otherAudiencePlaceholder: "Np. inżynierowie devops, mamy na macierzyńskim...",
    },
    blockC: {
      titleGoals: "Co chcesz osiągnąć swoimi postami?",
      subtitleGoals:
        "Wybierz max 2 najważniejsze cele. To kluczowe, aby AI mogło dobrze dopasować treść.",
      goals: {
        awareness: { label: "Rozpoznawalność", description: "Chcę, żeby więcej osób mnie znało" },
        inbound_contact: {
          label: "Nowe kontakty",
          description: "Chcę, żeby ludzie do mnie pisali / zgłaszali się",
        },
        engagement: { label: "Zaangażowanie", description: "Chcę udostępnień i komentarzy" },
        credibility: {
          label: "Wiarygodność",
          description: "Chcę pokazać, że wiem co robię (autorytet)",
        },
        networking: { label: "Networking", description: "Chcę poznawać nowe osoby" },
        sales: { label: "Sprzedaż", description: "Chcę sprzedawać swoje produkty lub usługi" },
      },
      maxGoalsReached: "Wybrano 2 cele. Odznacz jeden z nich, aby wybrać inny.",
    },
  },
  profile: {
    title: "Profil AI",
    subtitle: "Zarządzaj informacjami o sobie i dostosuj pamięć AI do swoich aktualnych potrzeb.",
    reRunWizard: "Przejdź kreator ponownie",
    reRunWizardDescription:
      "Chcesz przejść krok po kroku przez proces konfiguracji? Uruchom kreator onboardingu z wczytanymi obecnymi danymi.",
    saveChanges: "Zapisz zmiany",
    saving: "Zapisywanie...",
    savedToast: "Profil AI został zaktualizowany!",
    errorToast: "Nie udało się zapisać zmian w profilu AI.",
    identitySection: {
      title: "Tożsamość i styl",
      subtitle: "Krótki opis tego, kim jesteś lub co robisz, pomagający AI dobrać odpowiedni ton.",
      label: "Opis działalności / rola",
      placeholder: "Np. Założyciel startupu AI, Programista, Twórca wideo...",
    },
    topicsSection: {
      title: "Tematy i zainteresowania",
      subtitle: "Kluczowe zagadnienia, o których najczęściej tworzysz treści (max 5).",
      inputPlaceholder: "Wpisz temat i naciśnij Enter...",
      addBtn: "Dodaj",
      emptyState: "Brak dodanych tematów.",
    },
    platformsSection: {
      title: "Preferowane platformy",
      subtitle: "Główne kanały społecznościowe, na których publikujesz.",
    },
    audienceSection: {
      title: "Docelowi odbiorcy",
      subtitle: "Grupy odbiorców, do których kierujesz swój przekaz.",
      emptyState: "Brak zdefiniowanych grup odbiorców.",
    },
    goalsSection: {
      title: "Cele publikacji",
      subtitle: "Główne rezultaty, jakie chcesz osiągnąć poprzez swoje posty.",
      emptyState: "Brak zdefiniowanych celów.",
    },
  },
};
