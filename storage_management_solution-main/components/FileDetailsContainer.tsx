"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { Client, Realtime } from "appwrite";
import { FileDetails } from "./ActionsModalContent";

interface RealtimeResponseEvent {
  events: string[];
}
// 1️⃣ Appwrite client & Realtime örneği
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!) // e.g. "https://[YOUR_DOMAIN].appwrite.io/v1"
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!); // proje ID

const realtime = new Realtime(client);

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function FileDetailsContainer({ fileId }: { fileId: string }) {
  // 2️⃣ SWR ile dokümanı çek
  const { data, error, mutate } = useSWR(`/api/files/${fileId}`, fetcher);

  // 3️⃣ Realtime güncellemeleri dinle
  useEffect(() => {
    if (!data) return;
    const channel = `databases.${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}.collections.${process.env.NEXT_PUBLIC_FILES_COLLECTION_ID}.documents.${fileId}`;
    const subscription = realtime.subscribe(
      [channel],
      (res: RealtimeResponseEvent) => {
        if (res.events.includes("databases.document.update")) {
          mutate();
        }
      },
    );
    return () => {
      subscription.unsubscribe();
    };
  }, [data, fileId, mutate]);

  if (error) return <p className="text-red-500">Yükleme hatası.</p>;
  if (!data) return <p>Yükleniyor…</p>;

  // 4️⃣ Güncel veriyi FileDetails’e ver
  return <FileDetails file={data} />;
}
