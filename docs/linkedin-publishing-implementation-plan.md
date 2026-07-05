## LinkedIn Publishing Implementation Plan

### Cel dokumentu

To jest plan wdrozenia do realizacji w kodzie, podzielony na fazy. Zaklada clean architecture, brak lokalnych hasel i mozliwosc pozniejszego rozszerzenia na kolejne platformy.

Dokument uzupelnia:

- `docs/linkedin-publishing-mvp-notes.md`

## Stan wyjsciowy

### Co juz mamy

- frontend studio z flow generate -> edit -> preview -> publish CTA
- backend FastAPI w clean architecture
- async jobs dla generowania przez RabbitMQ
- upload plikow do MinIO
- auth przez Clerk

### Najwazniejsze braki przed publish

- brak lokalnego modelu `app_users`
- brak ownership dla `drafts` i `uploaded_files`
- brak social connections
- brak publish jobs i publish statusow
- brak OAuth flow dla LinkedIna
- brak backendowego schedulera publikacji

## Architektura docelowa

### Zasady

- provider tozsamosci jest zewnetrzny
- aplikacja ma wlasny model uzytkownika bez hasel
- publish jest osobnym bounded contextem od generate
- integracje z platformami siedza za portami
- wszystkie dane userowe maja jawnego ownera

### Warstwy backendu

#### Domain

Nowe encje:

- `AppUser`
- `SocialConnection`
- `Publication`
- `PublicationAsset`

Nowe value objects / enumy:

- `AuthProvider`
- `SocialProvider`
- `PublicationStatus`
- `SocialConnectionStatus`
- `PublicationMode`

#### Application

Nowe porty:

- `AppUserRepository`
- `SocialConnectionRepository`
- `PublicationRepository`
- `PublicationJobQueue`
- `SocialOAuthClient`
- `SocialPublisher`
- `SocialAssetPreparer`
- `SecretCipher`

Nowe use case'y:

- `EnsureAppUserUseCase`
- `StartLinkedInConnectUseCase`
- `CompleteLinkedInConnectUseCase`
- `ListSocialConnectionsUseCase`
- `DisconnectSocialConnectionUseCase`
- `SubmitPublicationJobUseCase`
- `GetPublicationUseCase`
- `ListPublicationsUseCase`
- `ProcessPublicationJobUseCase`

#### Infrastructure

Nowe adaptery:

- `SqlAlchemyAppUserRepository`
- `SqlAlchemySocialConnectionRepository`
- `SqlAlchemyPublicationRepository`
- `RabbitMqPublicationJobQueue`
- `LinkedInOAuthClient`
- `LinkedInPublisher`
- `LinkedInAssetPreparer`
- `FernetSecretCipher` albo inny prosty adapter szyfrujacy

#### Interface

Nowe routery:

- `auth_sync.py` albo synchronizacja przez middleware/proxy route po stronie frontu
- `social_connections.py`
- `publications.py`

### Frontend

Nowe obszary:

- account connect management
- publish modal / panel dla LinkedIn
- publication history / status
- asset ordering UI pod multi-image

## Docelowy model danych

### 1. `app_users`

Cel:

- stabilny model usera aplikacyjnego niezalezny od Clerk

Proponowane pola:

- `id UUID PK`
- `auth_provider VARCHAR(32)`
- `auth_subject VARCHAR(255)`
- `primary_email VARCHAR(320) NULL`
- `display_name VARCHAR(255) NULL`
- `status VARCHAR(32)`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

Ograniczenia:

- unique `(auth_provider, auth_subject)`

### 2. Rozszerzenie `drafts`

Dodac:

- `app_user_id UUID NOT NULL`

Index:

- `ix_drafts_app_user_id`

### 3. Rozszerzenie `uploaded_files`

Dodac:

- `app_user_id UUID NOT NULL`

Index:

- `ix_uploaded_files_app_user_id`

### 4. `social_connections`

Cel:

- polaczone konta social przypisane do usera aplikacyjnego

Pola:

- `id UUID PK`
- `app_user_id UUID NOT NULL`
- `provider VARCHAR(32)`
- `provider_account_id VARCHAR(255)`
- `provider_account_urn VARCHAR(255)`
- `provider_account_name VARCHAR(255) NULL`
- `access_token_encrypted TEXT`
- `refresh_token_encrypted TEXT NULL`
- `expires_at TIMESTAMPTZ NULL`
- `scopes JSON NOT NULL DEFAULT []`
- `status VARCHAR(32)`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

Ograniczenia:

- unique `(provider, provider_account_id)`

### 5. `publications`

Cel:

- publish attempts, statusy i wynik publikacji

Pola:

- `id UUID PK`
- `app_user_id UUID NOT NULL`
- `draft_id UUID NOT NULL`
- `provider VARCHAR(32)`
- `social_connection_id UUID NOT NULL`
- `status VARCHAR(32)`
- `mode VARCHAR(32)`
- `platform_text TEXT NOT NULL`
- `platform_payload JSON NOT NULL DEFAULT {}`
- `external_post_id VARCHAR(255) NULL`
- `external_post_urn VARCHAR(255) NULL`
- `external_post_url TEXT NULL`
- `error_code VARCHAR(64) NULL`
- `error_detail TEXT NULL`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`
- `published_at TIMESTAMPTZ NULL`

Indexy:

- `ix_publications_app_user_id`
- `ix_publications_draft_id`
- `ix_publications_status`
- `ix_publications_created_at`

### 6. `publication_assets`

Cel:

- zapis kolejnosci i mapowania lokalnych plikow na assety platformy

Pola:

- `id UUID PK`
- `publication_id UUID NOT NULL`
- `uploaded_file_id UUID NOT NULL`
- `sort_order INT NOT NULL`
- `provider_asset_id VARCHAR(255) NULL`
- `provider_asset_urn VARCHAR(255) NULL`
- `alt_text TEXT NULL`
- `created_at TIMESTAMPTZ`

Ograniczenia:

- unique `(publication_id, sort_order)`

## Kontrakt tozsamosci

### Decyzja

Backend nie ufa bezposrednio anonimowym requestom na userowe zasoby. Frontend przekazuje trusted identity przez wewnetrzny proxy route, tak jak juz robi dla `/api/generate`.

### Docelowy przeplyw

1. User loguje sie przez Clerk.
2. Frontend pobiera `userId`, email i opcjonalnie display name.
3. Pierwszy request do backendu przechodzi przez wewnetrzny proxy z `X-Actor-Id`.
4. Backend wywoluje `EnsureAppUserUseCase` i mapuje `(clerk, clerk_user_id)` -> `app_user_id`.
5. Dalsze use case'y operuja na `app_user_id`.

## Fazy wdrozenia

### Faza 0 - Przygotowanie fundamentow danych

#### Cel

Wprowadzic lokalny model usera aplikacyjnego i ownership danych bez dotykania jeszcze LinkedIn publish.

#### Zakres backend

1. Dodac do `domain/entities.py`:
- `AppUser`

2. Dodac do `infrastructure/db/models.py`:
- `AppUserModel`
- `app_user_id` do `DraftModel`
- `app_user_id` do `UploadedFileModel`

3. Dodac do `application/ports.py`:
- `AppUserRepository`

4. Dodac repozytorium SQLAlchemy:
- `SqlAlchemyAppUserRepository`

5. Dodac use case:
- `EnsureAppUserUseCase`

6. Dopiac DI w `backend/app/interface/dependencies.py`

7. Ochrona endpointow:
- `drafts`
- `uploads`

#### Zakres frontend

1. Zamienic klientowe wywolania userowych endpointow na authed proxy route tam, gdzie potrzebne.
2. Dodac serwerowe route proxy dla:
- `/api/drafts`
- `/api/drafts/[draftId]`
- `/api/uploads`
- `/api/uploads/[fileId]`

#### Kryterium done

- drafty i uploady sa izolowane per user
- backend ma lokalne `app_user_id`
- nadal nie trzymamy hasel

### Faza 1 - Social connections i OAuth LinkedIn

#### Cel

Pozwolic userowi podlaczyc konto LinkedIn i zapisac bezpiecznie tokeny.

#### Zakres backend

1. Dodac encje domenowe:
- `SocialConnection`

2. Dodac modele DB:
- `SocialConnectionModel`

3. Dodac porty:
- `SocialConnectionRepository`
- `SocialOAuthClient`
- `SecretCipher`

4. Dodac adaptery:
- `SqlAlchemySocialConnectionRepository`
- `LinkedInOAuthClient`
- `SecretCipher` implementation

5. Dodac use case'y:
- `StartLinkedInConnectUseCase`
- `CompleteLinkedInConnectUseCase`
- `ListSocialConnectionsUseCase`
- `DisconnectSocialConnectionUseCase`

6. Dodac router backendowy:
- `social_connections.py`

#### Zakres frontend

1. Dodac ekran lub sekcje `Connected accounts`.
2. Dodac przycisk `Connect LinkedIn`.
3. Dodac callback route do finalizacji OAuth.
4. Dodac liste polaczonych kont i opcje `Disconnect`.

#### Endpointy

- `GET /api/v1/social-connections`
- `POST /api/v1/social-connections/linkedin/start`
- `GET /api/v1/social-connections/linkedin/callback`
- `DELETE /api/v1/social-connections/{connection_id}`

#### Kryterium done

- user moze podlaczyc konto LinkedIn
- token jest zaszyfrowany w DB
- mozna wyswietlic stan polaczenia

### Faza 2 - Publish MVP v1: text + single image

#### Cel

Wypchnac pierwszy realny publish flow dla LinkedIn jako member posting.

#### Zakres backend

1. Dodac encje:
- `Publication`
- `PublicationAsset`

2. Dodac modele:
- `PublicationModel`
- `PublicationAssetModel`

3. Dodac porty:
- `PublicationRepository`
- `PublicationJobQueue`
- `SocialPublisher`
- `SocialAssetPreparer`

4. Dodac adaptery:
- `SqlAlchemyPublicationRepository`
- `RabbitMqPublicationJobQueue`
- `LinkedInPublisher`
- `LinkedInAssetPreparer`

5. Dodac use case'y:
- `SubmitPublicationJobUseCase`
- `GetPublicationUseCase`
- `ListPublicationsUseCase`
- `ProcessPublicationJobUseCase`

6. Dodac worker handling publish jobs.

7. Walidacja platformowa assetow dla LinkedIna:
- tylko `jpg/png/gif`
- max 1 obraz w v1

#### Zakres frontend

1. Zamienic stub `handlePublishNow()` na realny flow.
2. Dodac publish action tylko dla LinkedIna.
3. Dodac disabled states:
- brak polaczonego konta
- brak tresci
- unsupported asset format
- wiecej niz 1 asset w v1

4. Dodac publication status polling.
5. Dodac `Open on LinkedIn` po sukcesie.

#### Endpointy

- `POST /api/v1/publications`
- `GET /api/v1/publications/{publication_id}`
- `GET /api/v1/publications?draft_id=...`

#### Proponowany request `POST /publications`

```json
{
  "provider": "linkedin",
  "draft_id": "uuid",
  "social_connection_id": "uuid",
  "text": "finalny tekst posta",
  "file_ids": ["uuid"],
  "asset_order": ["uuid"]
}
```

#### Kryterium done

- user publikuje text-only
- user publikuje text + 1 image
- status publikacji zapisuje sie w DB
- po sukcesie mamy `external_post_urn` i link do posta

### Faza 3 - Multi-image i ordering

#### Cel

Dodac prawidlowy multi-image publish 2-20 oraz kontrolowana kolejnosc assetow.

#### Zakres backend

1. Rozszerzyc walidacje LinkedIn publish:
- `2-20` obrazow dla multi-image
- zachowanie kolejnosci `asset_order`

2. `LinkedInAssetPreparer` ma przygotowac wiele image URN.
3. `LinkedInPublisher` ma budowac payload `content.multiImage.images`.

#### Zakres frontend

1. Dodac drag-and-drop albo prosty reorder listy assetow.
2. Dodac alt text per asset.
3. Dodac walidacje:
- max 20
- min 2 dla multi-image

#### Kryterium done

- user ustawia kolejnosc
- backend publikuje w tej kolejnosci
- publication_assets zapisuje mapowanie i sort order

### Faza 4 - UX, observability, resilience

#### Cel

Domknac operacyjnie feature, bez jeszcze organization posting i schedulingu.

#### Zakres backend

1. Retry policy dla:
- `429`
- `5xx`
- transient upload failures

2. Rozszerzyc telemetry:
- publish request count
- publish success rate
- publish failure reasons
- latency

3. Dodac sensowne bledy domenowe:
- unsupported_asset_type
- too_many_assets
- social_connection_invalid
- social_token_expired
- provider_rate_limited

#### Zakres frontend

1. Lepsze komunikaty bledow.
2. Publication history per draft.
3. Retry button dla failed publication.

#### Kryterium done

- publish flow jest debuggowalny
- transient errors nie koncza sie od razu twardym fail
- user widzi sensowny status

### Faza 5 - Organization posting i scheduling

#### Cel

Dopiero po stabilnym MVP member posting rozszerzyc produkt.

#### Zakres

1. `w_organization_social`
2. wybieranie authora typu organization
3. backendowy scheduling model
4. delayed jobs / scheduler worker

#### Dlaczego osobna faza

- wieksza zlozonosc uprawnien
- osobny UX wyboru autora
- obecny schedule jest tylko UI/localStorage

## Kolejnosc merge'y

### PR 1

- `app_users`
- ownership dla drafts/uploads
- auth proxy dla userowych endpointow

### PR 2

- social_connections
- LinkedIn OAuth connect/disconnect

### PR 3

- publications + queue + worker
- publish text-only

### PR 4

- single image publish
- platform validation

### PR 5

- multi-image + ordering + alt text

### PR 6

- retry / telemetry / history UX

## Proponowana struktura plikow backend

### Domain

- `backend/app/domain/entities.py`
- `backend/app/domain/value_objects.py`
- `backend/app/domain/exceptions.py`

Mozliwe nowe pliki:

- `backend/app/domain/social_value_objects.py`

### Application

- `backend/app/application/ports.py`
- `backend/app/application/use_cases/app_users.py`
- `backend/app/application/use_cases/social_connections.py`
- `backend/app/application/use_cases/publications.py`

### Infrastructure

- `backend/app/infrastructure/db/models.py`
- `backend/app/infrastructure/db/repositories.py`
- `backend/app/infrastructure/messaging/rabbitmq.py`
- `backend/app/infrastructure/social/linkedin_oauth.py`
- `backend/app/infrastructure/social/linkedin_publisher.py`
- `backend/app/infrastructure/security/fernet_cipher.py`

### Interface

- `backend/app/interface/api/v1/social_connections.py`
- `backend/app/interface/api/v1/publications.py`
- `backend/app/interface/schemas.py`
- `backend/app/interface/dependencies.py`
- `backend/app/interface/api/v1/router.py`

## Proponowana struktura plikow frontend

- `frontend/app/api/social-connections/...`
- `frontend/app/api/publications/...`
- `frontend/app/api/drafts/...`
- `frontend/app/api/uploads/...`
- `frontend/lib/social-connections-api.ts`
- `frontend/lib/publications-api.ts`
- `frontend/components/settings/social-connections-panel.tsx`
- `frontend/components/studio/publish-panel.tsx`
- `frontend/components/studio/asset-order-list.tsx`

## Decyzje implementacyjne

### 1. Czy uzywac jednej abstrakcji `SocialPublisher` na start?

Tak.

Powod:

- koszt jest niski
- projekt od razu jest gotowy pod kolejne platformy
- nie trzeba budowac shared mega-frameworka, wystarczy proste interface + adapter LinkedIn

### 2. Czy dodawac lokalne hasla lub auth fallback?

Nie.

Powod:

- nie ma potrzeby produktowej
- psuje to prostote modelu
- zwieksza powierzchnie bezpieczenstwa

### 3. Czy scheduling robic teraz?

Nie.

Powod:

- obecny system jeszcze nie ma nawet real-time publish
- scheduling wymaga osobnego modelu lifecycle i job orchestration

## Krytyczne uwagi do obecnego kodu przed startem implementacji

1. `drafts` i `uploads` nie sa jeszcze zaprojektowane jako per-user owned resources.
2. `publish` w studio jest tylko stubem.
3. `schedule` siedzi w `localStorage`, wiec nie jest backendowym featurem.
4. obecny upload formatow jest szerszy niz realne mozliwosci LinkedIna.

## Minimalna definicja sukcesu

Funkcjonalnosc uznajemy za wdrozona MVP, gdy:

- zalogowany user moze polaczyc LinkedIn
- zalogowany user moze opublikowac wygenerowany LinkedIn post z Feedstudio
- text-only i single-image dzialaja end-to-end
- publikacja zapisuje status i wynik w DB
- dane sa izolowane per user
- nie przechowujemy lokalnych hasel
- architektura pozwala dodac kolejna platforme bez przebudowy calego systemu
