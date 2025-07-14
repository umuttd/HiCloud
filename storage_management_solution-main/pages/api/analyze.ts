// pages/api/analyze.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { createAdminClient } from "@/lib/appwrite";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

type Data =
  | { status: "ok"; summary: string; keywords: string[]; category: string }
  | { status: "error"; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ status: "error", error: "Method Not Allowed" });
  }

  const { fileId } = req.body as { fileId?: string };
  if (!fileId) {
    return res.status(400).json({ status: "error", error: "fileId missing" });
  }

  const { databases, storage } = await createAdminClient();

  // 1️⃣ Belgeyi çek
  let fileDoc;
  try {
    fileDoc = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_FILES_COLLECTION_ID!,
      fileId,
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("❌ getDocument error:", msg);
    return res
      .status(500)
      .json({ status: "error", error: "Document not found" });
  }

  // 2️⃣ Dosyayı indir
  let fileBuffer: ArrayBuffer;
  try {
    fileBuffer = await storage.getFileDownload(
      process.env.APPWRITE_BUCKET_ID!,
      fileDoc.bucketFileId,
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("❌ getFileDownload error:", msg);
    return res
      .status(500)
      .json({ status: "error", error: "File download failed" });
  }

  // 3️⃣ Metni çıkar
  let text = "";
  try {
    if (fileDoc.extension === "pdf") {
      text = (await pdfParse(Buffer.from(fileBuffer))).text;
    } else if (fileDoc.extension === "docx") {
      text = (await mammoth.extractRawText({ buffer: Buffer.from(fileBuffer) }))
        .value;
    } else {
      text = new TextDecoder().decode(fileBuffer);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("❌ text extraction error:", msg);
    return res
      .status(500)
      .json({ status: "error", error: "Text extraction failed" });
  }

  let summary: string, keywords: string[], category: string;
  try {
    const prompt = `
Aşağıdaki metin için:
1) Kısa özet oluştur.
2) Anahtar kelimeleri dizi olarak döndür.
3) Bir kategori ata (Rapor, Makale, Not, Diğer).

Metin:
"""${text.slice(0, 2000)}"""

LÜTFEN CEVABI SADECE GEÇERLİ BİR JSON OBJE DÖNDÜRECEK ŞEKİLDE VERİN.
ÖRNEK:
{"summary":"...","keywords":["..."],"category":"..."}
`;
    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a JSON formatter. Respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
    });
    const content = aiRes.choices[0].message.content.trim();
    ({ summary, keywords, category } = JSON.parse(content) as {
      summary: string;
      keywords: string[];
      category: string;
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(" OpenAI error:", message);
    return res
      .status(500)
      .json({ status: "error", error: `AI analysis failed: ${message}` });
  }

  // 5️⃣ Veritabanını güncelle
  try {
    await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_FILES_COLLECTION_ID!,
      fileId,
      { summary, keywords, category },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(" DB update error:", msg);
    return res
      .status(500)
      .json({ status: "error", error: `DB update failed: ${msg}` });
  }

  // 6️⃣ Başarıyla dön
  return res.status(200).json({ status: "ok", summary, keywords, category });
}
