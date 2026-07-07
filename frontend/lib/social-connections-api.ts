import axios from "axios";

const socialConnectionsApi = axios.create({
  timeout: 60000,
});

export type SocialConnection = {
  id: string;
  provider: string;
  provider_account_id: string;
  provider_account_urn: string;
  provider_account_name: string | null;
  provider_profile_image_url: string | null;
  expires_at: string | null;
  scopes: string[];
  status: string;
  created_at: string;
  updated_at: string;
};

export async function listSocialConnections(): Promise<SocialConnection[]> {
  const response = await socialConnectionsApi.get<SocialConnection[]>("/api/social-connections");
  return response.data;
}

export async function disconnectSocialConnection(connectionId: string): Promise<void> {
  await socialConnectionsApi.delete(`/api/social-connections/${connectionId}`);
}
