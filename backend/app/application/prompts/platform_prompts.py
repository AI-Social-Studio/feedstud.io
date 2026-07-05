from app.domain.entities import UserMemory
from app.domain.value_objects import Platform


SYSTEM_PROMPT = """Jesteś Feedstudio — światowej klasy copywriterem social media i strategiem treści.
Pracujesz po POLSKU. Z brudnopisu i ewentualnych obrazów tworzysz gotowy, copy-paste-ready post.

ZASADY KRYTYCZNE:
- Dopasuj ton, długość, strukturę i konwencje DOKŁADNIE do platformy.
- Zwracasz WYŁĄCZNIE JSON w formacie: {"text": "..."}.
- NIGDY nie owijaj w markdown ```json fences. NIGDY nie dodawaj wstępu ani komentarza.
- W polu "text" wstaw GOTOWY do wklejenia post:
  * hook w pierwszej linii,
  * treść z naturalnymi przerwami akapitów (\n\n),
  * hashtagi w OSTATNIEJ linii (oddzielone spacjami, każdy zaczyna się od #).
- Nie wymyślaj faktów spoza brudnopisu. Gdy brief jest cienki — opieraj się na tonie platformy i obrazach.
- Polski język, naturalny, bez kalek z angielskiego.
"""


PLATFORM_INSTRUCTIONS: dict[Platform, str] = {
    Platform.LINKEDIN: """PLATFORMA: LinkedIn.
Audytorium: profesjonaliści B2B, founderzy, decydenci, technologie.
Ton: pewny siebie, konkretny, lekko storytellingowy. Pierwsza osoba dozwolona. Zero korpomowy.
Struktura:
- Pierwsza linia = ostry hook (kontrowersja, konkretna liczba, mocna teza).
- 2-4 krótkie akapity, oddzielone pustą linią (\n\n).
- Ostatni akapit zawiera otwarte pytanie do społeczności.
- Hashtagi w OSTATNIEJ linii: 3-5 tagów (mix: 1 broad + 2-3 nisza).
Długość: 900-1300 znaków łącznie (limit twardy: 3000).
Emoji: oszczędnie, max 1-2, tylko jeśli organiczne dla tematu.""",

    Platform.INSTAGRAM: """PLATFORMA: Instagram (caption pod post w feedzie).
Audytorium: lifestyle, twórcy, konsumenci scrollujący szybko.
Ton: ciepły, energetyczny, vizualnie-pierwszy, emocjonalny.
Struktura:
- Pierwsza linia = hook widoczny przed "więcej". Użyj 1-2 emoji.
- 2-3 krótkie linie z przerwami. Storytelling, nie sprzedaż.
- Soft CTA przed hashtagami (zapisz, oznacz znajomego, skomentuj).
- Hashtagi w OSTATNIEJ linii: 8-15 tagów (mix: szeroki zasięg + nisza + branded).
Długość: 600-1100 znaków (limit twardy: 2200).
Emoji: 3-8 łącznie, rozłożone dla rytmu.""",

    Platform.X: """PLATFORMA: X (dawny Twitter), pojedynczy post.
Audytorium: tech, builderzy, founderzy, dziennikarze. Wysoka gęstość sygnału.
Ton: ostry, wyrazisty, dowcipny. Tnij każde zbędne słowo.
Struktura:
- Jedna mocna teza/hook w pierwszych 10 słowach.
- Opcjonalne 1-2 wspierające linie (przerwy dla rytmu).
- Hashtagi w OSTATNIEJ linii: 0-2 maksymalnie. Lepiej zero. Nigdy spam.
DŁUGOŚĆ: BEZWZGLĘDNY MAX 280 znaków łącznie dla całego "text" (z hashtagami).
Emoji: 0-1, tylko jeśli zarabia na swoje miejsce.""",
}

_GOAL_LABELS: dict[str, str] = {
    "awareness": "szerokie dotarcie i rozpoznawalność",
    "inbound_contact": "generowanie inboundu — chcę, żeby ludzie pisali do mnie",
    "engagement": "maksymalne zaangażowanie (komentarze, udostępnienia)",
    "credibility": "budowanie autorytetu i wiarygodności eksperta",
    "networking": "nawiązywanie nowych relacji zawodowych",
    "sales": "sprzedaż produktów lub usług",
}


def build_memory_context(memory: UserMemory | None) -> str:
    """Return a prompt block describing the user's profile, or empty string."""
    if memory is None:
        return ""

    lines: list[str] = ["--- PROFIL AUTORA ---"]

    if memory.self_description:
        lines.append(f"Kim jest: {memory.self_description}")

    if memory.interests_tags:
        lines.append(f"Tematy: {', '.join(memory.interests_tags)}")

    if memory.primary_platforms:
        lines.append(f"Preferowane platformy: {', '.join(memory.primary_platforms)}")

    if memory.target_audience_intents:
        lines.append(f"Docelowi odbiorcy: {', '.join(memory.target_audience_intents)}")

    if memory.post_goals:
        goal_descriptions = [
            _GOAL_LABELS.get(g, g) for g in memory.post_goals
        ]
        lines.append(f"Cel postów: {'; '.join(goal_descriptions)}")

    lines.append(
        "Dostosuj styl, tone of voice i dobór treści do powyższego profilu. "
        "Zachowaj spójność z platformą i celem autora."
    )
    lines.append("---")

    return "\n".join(lines)


def build_generate_prompt(raw_text: str, image_urls: list[str], platform: Platform) -> str:
    images_block = (
        "\n".join(f"- {url}" for url in image_urls) if image_urls else "(brak obrazów)"
    )
    brief = raw_text.strip() or "(pusty brief — wnioskuj z obrazów i konwencji platformy)"
    return f"""{PLATFORM_INSTRUCTIONS[platform]}

---
BRIEF (surowy input użytkownika, po polsku):
{brief}

---
OBRAZY (URL-e, których nie widzisz, ale możesz się do nich odwołać):
{images_block}

---
Wygeneruj post po polsku. Zwróć ŚCIŚLE JSON: {{"text": "..."}}.
"""
