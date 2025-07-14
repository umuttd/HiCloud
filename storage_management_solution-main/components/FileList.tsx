"use client";

import React from "react";
import useSWR from "swr";
import Card from "@/components/Card";
import { Models } from "node-appwrite";

interface FileListProps {
    search?: string;
    keywords?: string[];
    category?: string | null;
    typeFilter?: string; // optional, e.g. "documents" veya "images"
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const FileList: React.FC<FileListProps> = ({
                                                      search = "",
                                                      keywords = [],
                                                      category = null,
                                                      typeFilter,
                                                  }) => {
    const params = new URLSearchParams();
    if (search)    params.set("search", search);
    if (keywords.length) params.set("keywords", keywords.join(","));
    if (category)  params.set("category", category);
    if (typeFilter) params.set("type", typeFilter);

    const { data, error } = useSWR<{ documents: Models.Document[] }>(
        `/api/files?${params.toString()}`,
        fetcher
    );

    if (error) return <p>Dosyalar yüklenirken hata oluştu.</p>;
    if (!data) return <p>Yükleniyor…</p>;
    if (data.documents.length === 0) return <p>Filtrelere uygun dosya bulunamadı.</p>;

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.documents.map(file => (
                <Card key={file.$id} file={file} />
            ))}
        </div>
    );
};
