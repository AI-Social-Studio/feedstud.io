"use client";

import Link from "next/link";
import { startTransition, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { disconnectSocialConnection, type SocialConnection } from "@/lib/social-connections-api";
import { getApiErrorMessage } from "@/lib/studio-api";

type Props = {
  connections: SocialConnection[];
};

export function SocialConnectionsCard({ connections: initialConnections }: Props) {
  const { dict } = useLanguage();
  const [connections, setConnections] = useState(initialConnections);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [disconnectError, setDisconnectError] = useState<string | null>(null);
  const linkedinConnection =
    connections.find((connection) => connection.provider === "linkedin") ?? null;

  async function handleDisconnect(connectionId: string) {
    setDisconnectingId(connectionId);
    setDisconnectError(null);
    try {
      await disconnectSocialConnection(connectionId);
      startTransition(() => {
        setConnections((prev) => prev.filter((connection) => connection.id !== connectionId));
      });
    } catch (error) {
      setDisconnectError(getApiErrorMessage(error));
    } finally {
      setDisconnectingId(null);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {dict.socialConnections.title}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {dict.socialConnections.subtitle}
          </p>
        </div>
        {!linkedinConnection ? (
          <Link
            href="/api/social-connections/linkedin/start"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            {dict.socialConnections.connectLinkedIn}
          </Link>
        ) : null}
      </div>

      {linkedinConnection ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {dict.socialConnections.providerLinkedIn}
              </div>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {linkedinConnection.provider_account_name || linkedinConnection.provider_account_urn}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDisconnect(linkedinConnection.id)}
              disabled={disconnectingId === linkedinConnection.id}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-red-700 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
              {disconnectingId === linkedinConnection.id
                ? dict.socialConnections.disconnecting
                : dict.socialConnections.disconnect}
            </button>
          </div>
          {disconnectError ? (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
              {disconnectError}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400">
          {dict.socialConnections.emptyLinkedIn}
        </div>
      )}
    </div>
  );
}
