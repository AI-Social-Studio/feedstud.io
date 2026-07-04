import axios from "axios";

const publicationsApi = axios.create({
  timeout: 60000,
});

export type PublicationAsset = {
  id: string;
  uploaded_file_id: string;
  sort_order: number;
  provider_asset_id: string | null;
  provider_asset_urn: string | null;
  alt_text: string | null;
  created_at: string;
};

export type Publication = {
  id: string;
  draft_id: string;
  provider: "linkedin";
  social_connection_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  mode: string;
  platform_text: string;
  external_post_id: string | null;
  external_post_urn: string | null;
  external_post_url: string | null;
  error_code: string | null;
  error_detail: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  assets: PublicationAsset[];
};

export type CreatePublicationRequest = {
  provider: "linkedin";
  draft_id: string;
  social_connection_id: string;
  text: string;
  file_ids: string[];
  asset_order: string[];
};

export async function createPublication(payload: CreatePublicationRequest): Promise<Publication> {
  const response = await publicationsApi.post<Publication>("/api/publications", payload);
  return response.data;
}

export async function getPublication(publicationId: string): Promise<Publication> {
  const response = await publicationsApi.get<Publication>(`/api/publications/${publicationId}`);
  return response.data;
}

export async function listPublications(draftId: string): Promise<Publication[]> {
  const response = await publicationsApi.get<Publication[]>("/api/publications", {
    params: { draft_id: draftId },
  });
  return response.data;
}

export async function waitForPublication(publicationId: string): Promise<Publication> {
  const deadline = Date.now() + 90_000;
  let delayMs = 1000;
  let transientFailures = 0;

  while (Date.now() < deadline) {
    try {
      const publication = await getPublication(publicationId);
      if (publication.status === "completed") return publication;
      if (publication.status === "failed") return publication;
      transientFailures = 0;
    } catch (error) {
      if (!axios.isAxiosError(error)) throw error;
      transientFailures += 1;
      if (transientFailures >= 3) throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
    delayMs = Math.min(delayMs * 1.5, 4000);
  }

  throw new Error("Publication is taking too long. Try again.");
}
