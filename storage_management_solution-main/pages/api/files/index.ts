// pages/api/files/index.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Query, Models } from "node-appwrite";

// API yanıt tipi: Başarılı durumda Models.Document dizisi, hata durumda mesaj
type ApiResponse = { documents: Models.Document[] } | { error: string };
// istemciden gelen HTTP GET isteklerini alıp Appwrite veritabanındaki dosya kayıtlarını filtrelenmiş şekilde döndürmek
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Query parametrelerini tek string'e indirgeme
  const getSingle = (v: string | string[] | undefined): string =>
    Array.isArray(v) ? v[0] : (v ?? "");

  const searchParam = getSingle(req.query.search);
  const keywordsParam = getSingle(req.query.keywords);
  const categoryParam = getSingle(req.query.category);
  const typesParam = getSingle(req.query.types);

  // Virgülle ayrılmış stringleri diziye çevirme
  const keywords = keywordsParam
    ? keywordsParam
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : [];
  const types = typesParam
    ? typesParam
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  const category = categoryParam || null;

  // Appwrite sorgularını oluşturma
  const queries: string[] = [];
  if (types.length) {
    queries.push(Query.equal("type", types));
  }
  if (searchParam) {
    queries.push(Query.contains("name", searchParam));
  }
  if (keywords.length) {
    queries.push(Query.contains("keywords", keywords));
  }
  if (category) {
    queries.push(Query.equal("category", category));
  }
  // Sorgu sayısını sınırlama (isteğe bağlı)
  queries.push(Query.limit(100));

  try {
    const { databases } = await createAdminClient();
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      queries,
    );
    return res.status(200).json({ documents: result.documents });
  } catch (err: unknown) {
    console.error("❌ /api/files error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}
