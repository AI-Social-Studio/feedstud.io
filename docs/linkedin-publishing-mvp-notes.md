## LinkedIn Publishing MVP Notes

### Cel

Notatka porzadkuje ograniczenia LinkedIn API, aktualny stan auth w repo i decyzje architektoniczne pod MVP publikacji.

### Aktualny stan w repo

- Aplikacja uzywa Clerk jako zewnetrznego providera auth.
- Nie ma lokalnej tabeli `users` w backendzie.
- Backend zna tylko `actor_user_id` przekazywane z frontendu dla wybranych endpointow.
- Role aplikacyjne sa trzymane w Clerk `publicMetadata`.

Istotne miejsca w kodzie:

- `frontend/lib/authenticated-backend-api-proxy.ts`
- `frontend/lib/auth/get-auth-context.ts`
- `frontend/lib/auth/roles.ts`
- `frontend/app/api/webhooks/clerk/route.ts`
- `backend/app/interface/dependencies.py`
- `backend/app/infrastructure/db/models.py`

### Odpowiedz na pytanie o `users`

Na ten moment nie ma u Ciebie tabeli `users` napisanej jako lokalny model domenowy aplikacji.

To oznacza:

- source of truth dla tozsamosci uzytkownika to Clerk
- backend nie trzyma lokalnych hasel
- zmiana providera auth nie bedzie trywialna, bo identyfikator uzytkownika jest dzisiaj de facto identyfikatorem Clerk
- jednoczesnie nie jestes zwiazany z lokalnym systemem hasel, co jest dobre

### Rekomendacja auth pod clean architecture

Zostaw external auth i nie przechowuj lokalnie hasel.

Zalecany model:

1. Clerk pozostaje providerem tozsamosci.
2. Dodaj lokalna tabele `app_users`, ale bez hasel.
3. W `app_users` trzymaj tylko dane aplikacyjne i stabilny mapping na providera.

Przykladowe pola `app_users`:

- `id` - wewnetrzne UUID aplikacji
- `auth_provider` - np. `clerk`
- `auth_subject` - np. Clerk `userId`
- `primary_email`
- `status`
- `created_at`
- `updated_at`

To daje Ci:

- brak lokalnych hasel
- mozliwosc latwiejszego przepiecia providera w przyszlosci
- stabilne klucze obce w aplikacji niezalezne od Clerk
- czystsze relacje dla draftow, uploadow, social connections i publications

### Rekomendowane decyzje danych

Przed publish MVP warto uporzadkowac ownership danych:

- dodac ownera do `drafts`
- dodac ownera do `uploaded_files`
- w nowych tabelach publish nie opierac FK na surowym `clerk_user_id`, tylko na lokalnym `app_user_id`

### LinkedIn API - najwazniejsze ograniczenia MVP

#### 1. Potwierdzenie na stronie LinkedIna

Nie planujemy flow typu:

- otworz compose LinkedIna
- wstaw gotowy tekst
- dolacz media
- user tylko klika publish na LinkedIn

Powod:

- oficjalne API LinkedIna wspiera publikacje przez API, a nie stabilny compose prefill z mediami
- taki wariant bylby kruchy i slaby produktowo

Decyzja:

- finalne potwierdzenie robimy w naszym UI albo publikujemy bezposrednio po kliknieciu w Feedstudio

#### 2. Typy postow istotne dla MVP

LinkedIn Posts API wspiera organiczne posty:

- text only
- single image
- multi-image
- article
- video
- document

Dla MVP rekomendacja:

- etap 1: text only + single image
- etap 2: multi-image

#### 3. Limit liczby zdjec

MultiImage API:

- minimum `2` obrazy
- maksimum `20` obrazow

Wniosek dla produktu:

- jesli user wybierze 1 obraz, publikujemy jako zwykly image post
- jesli wybierze 2-20, mozemy publikowac jako multi-image
- jesli wybierze ponad 20, trzeba walidowac i blokowac juz w UI i backendzie

#### 4. Kolejnosc zdjec

Tak, kolejnosc obrazow jest kontrolowana przez API.

W praktyce:

- `content.multiImage.images` jest tablica
- LinkedIn zwraca obrazy w kolejnosci tablicy
- kolejnosc wyslana przez backend powinna byc traktowana jako kolejnosc publikacji

Wniosek produktowy:

- warto dodac w UI reordering assetow przed publish
- backend powinien zachowac kolejnosc przeslana przez frontend

#### 5. Format i ograniczenia obrazow

Images API / MultiImage API:

- formaty: `JPG`, `PNG`, `GIF`
- GIF do `250` klatek
- maksymalnie mniej niz `36,152,320` pikseli

Uwaga:

- obecny upload w aplikacji dopuszcza tez `webp`, `svg+xml`, `heic`, `heif`
- to nie pokrywa sie 1:1 z ograniczeniami LinkedIna

Wniosek:

- publish layer musi miec osobna walidacje per platforma
- nie wolno zakladac, ze skoro plik jest poprawny dla uploadu do Feedstudio, to jest poprawny dla LinkedIna

#### 6. Uprawnienia

MVP publikacji jako osoba wymaga:

- `w_member_social`

Publikacja jako organization/page wymaga:

- `w_organization_social`
- odpowiedniej roli uzytkownika na stronie firmowej

Rekomendacja MVP:

- zaczac od `member posting`
- organization posting dodac pozniej

#### 7. Odczyt obrazow po uploadzie

W docs LinkedIn jest istotna niuansa:

- token tylko z `w_member_social` jest wystarczajacy do write flow
- ale dla versioned `rest/images` GET moze byc niewystarczajacy

Wniosek:

- MVP powinno opierac sie na write flow: initialize upload -> binary upload -> publish post
- nie projektowac MVP tak, aby wymagalo dodatkowego odczytu metadanych obrazu po stronie LinkedIna

#### 8. Rate limiting

W starszych docs `Share on LinkedIn` widac limity:

- member daily limit: `150` requestow
- application daily limit: `100,000` requestow

Trzeba traktowac to ostroznie:

- LinkedIn zmienia wersje API i limity moga sie roznic per produkt / scope / app status
- w implementacji trzeba obslugiwac `429`

Wniosek:

- publish jobs musza miec retry/backoff dla `429` i `5xx`
- telemetry publish requests jest potrzebne od razu

### Rekomendowana architektura publish

#### Warstwa domenowa

Nowe encje / aggregate'y:

- `AppUser`
- `SocialConnection`
- `Publication`
- `PublicationAsset`

#### Porty aplikacyjne

- `AppUserRepository`
- `SocialConnectionRepository`
- `PublicationRepository`
- `SocialPublisher`
- `SocialMediaAssetUploader`

#### Adapter LinkedIn

- `LinkedInOAuthClient`
- `LinkedInPublisher`
- `LinkedInImageUploader`

### Minimalne tabele do dodania

#### `app_users`

- wewnetrzne konto aplikacyjne bez hasel

#### `social_connections`

- polaczone konta social per user

Przykladowe pola:

- `id`
- `app_user_id`
- `provider`
- `provider_account_id`
- `provider_account_urn`
- `access_token_encrypted`
- `refresh_token_encrypted`
- `expires_at`
- `scopes_json`
- `status`
- `created_at`
- `updated_at`

#### `publications`

- historia i status publikacji

Przykladowe pola:

- `id`
- `app_user_id`
- `draft_id`
- `provider`
- `social_connection_id`
- `status`
- `external_post_id`
- `external_post_url`
- `error_code`
- `error_detail`
- `created_at`
- `updated_at`
- `published_at`

### Decyzje pod clean code

- nie przechowujemy lokalnych hasel
- oddzielamy `identity provider` od `application user`
- publish nie wchodzi do obecnego use case `generate`; dostaje osobny flow
- walidacja assetow musi byc per platforma, nie globalna
- kolejnosc obrazow traktujemy jako dane biznesowe i zapisujemy jawnie
- schedule publikacji nie powinien zostac tylko w `localStorage`; musi miec backendowy model i job queue

### Rekomendowany zakres MVP

#### MVP v1

- connect LinkedIn
- publikacja jako member
- text only
- single image
- zapis publication status
- link do opublikowanego posta

#### MVP v1.1

- multi-image 2-20
- reordering obrazow w UI
- lepsza obsluga rate limit i retry

#### MVP v2

- posting jako organization/page
- scheduling
- status sync / richer analytics

### Zrodla

- LinkedIn Posts API
- LinkedIn Images API
- LinkedIn MultiImage API
- LinkedIn Share on LinkedIn docs
