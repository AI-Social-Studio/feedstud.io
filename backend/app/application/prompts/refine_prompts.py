from app.domain.value_objects import Platform, RefineAction


REFINE_SYSTEM_PROMPT = """Jesteś Feedstudio — refinujesz istniejący post po polsku.
Dostajesz tekst posta i akcję modyfikującą. Zwracasz przerobiony post.

ZASADY:
- Pracujesz po POLSKU.
- Zachowaj sens i kluczowe fakty oryginału.
- Trzymaj limity i konwencje platformy (długość, hashtagi w ostatniej linii, emoji).
- Zwracasz WYŁĄCZNIE JSON: {"text": "..."}. Bez markdown fences, bez wstępów.
- "text" to gotowy do wklejenia post (z \\n\\n między akapitami, hashtagi w ostatniej linii).
"""


REFINE_INSTRUCTIONS: dict[RefineAction, str] = {
    RefineAction.HOOK: "Zmień HOOK (pierwszą linię/zdanie) na bardziej przyciągający uwagę. Reszta posta bez zmian merytorycznych.",
    RefineAction.SHORTEN: "Skróć cały post o ~30-40%. Zachowaj clue, hook i hashtagi. Tnij watę.",
    RefineAction.FORMAL: "Przepisz BARDZIEJ FORMALNIE. Profesjonalny ton, mniej potocznych zwrotów, więcej precyzji. Bez zmiany treści.",
    RefineAction.CASUAL: "Przepisz LUŹNIEJ. Konwersacyjnie, jak do znajomego, lekko, bezpośrednio. Bez utraty profesjonalizmu jeśli platforma to LinkedIn.",
    RefineAction.CTA: "Dodaj/wzmocnij CTA na końcu (przed hashtagami). Konkretne wezwanie do akcji (komentuj, zapisz, oznacz, kliknij link). Reszta bez zmian.",
    RefineAction.HASHTAGS: "Wymień zestaw hashtagów na lepszy/trafniejszy mix. Trzymaj konwencję platformy (LinkedIn 3-5, Instagram 8-15, X 0-2). Reszta posta bez zmian.",
}


PLATFORM_CONTEXT: dict[Platform, str] = {
    Platform.LINKEDIN: "Platforma: LinkedIn. Limit 3000 znaków. Hashtagi 3-5 w ostatniej linii. Ton B2B, profesjonalny.",
    Platform.INSTAGRAM: "Platforma: Instagram. Limit 2200 znaków. Hashtagi 8-15 w ostatniej linii. Ton ciepły, emocjonalny, z emoji.",
    Platform.X: "Platforma: X. TWARDY LIMIT 280 znaków łącznie. Hashtagi 0-2 w ostatniej linii. Ton ostry, wyrazisty.",
}


def build_refine_prompt(platform: Platform, text: str, action: RefineAction) -> str:
    return f"""{PLATFORM_CONTEXT[platform]}

AKCJA: {REFINE_INSTRUCTIONS[action]}

---
ORYGINALNY POST:
{text}

---
Zwróć ŚCIŚLE JSON: {{"text": "..."}} z przerobionym postem po polsku.
"""
