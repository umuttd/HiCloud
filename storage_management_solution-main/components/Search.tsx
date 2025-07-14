"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { Models } from "node-appwrite";
import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import { useDebounce } from "use-debounce";

const Search = () => {
  const [query, setQuery] = useState<string>("");
  const [keywordsText, setKeywordsText] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get("search") ?? "";
  const keywordsQuery = searchParams?.get("keywords") ?? "";
  const categoryQuery = searchParams?.get("category") ?? "";

  const [results, setResults] = useState<Models.Document[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();

  // Debounce states
  const [debouncedSearch] = useDebounce<string>(query, 300);
  const [debouncedKeywords] = useDebounce<string>(keywordsText, 300);
  const [debouncedCategory] = useDebounce<string>(categoryFilter, 300);

  // URL params to state
  useEffect(() => {
    setQuery(searchQuery);
    setKeywordsText(keywordsQuery);
    setCategoryFilter(categoryQuery);
  }, [searchQuery, keywordsQuery, categoryQuery]);

  useEffect(() => {
    const fetchFiles = async () => {
      const hasSearch =
        typeof debouncedSearch === "string" && debouncedSearch.length > 0;
      const hasKeywords =
        typeof debouncedKeywords === "string" && debouncedKeywords.length > 0;
      const hasCategory =
        typeof debouncedCategory === "string" && debouncedCategory.length > 0;

      if (!hasSearch && !hasKeywords && !hasCategory) {
        setResults([]);
        setOpen(false);
        return;
      }

      const params = new URLSearchParams();
      if (hasSearch) params.set("search", debouncedSearch);
      if (hasKeywords) params.set("keywords", debouncedKeywords);
      if (hasCategory) params.set("category", debouncedCategory);

      try {
        const res = await fetch(`/api/files?${params.toString()}`);
        const data = await res.json();
        setResults(Array.isArray(data.documents) ? data.documents : []);
        setOpen(true);
      } catch {
        setResults([]);
        setOpen(false);
      }
    };

    fetchFiles();
  }, [debouncedSearch, debouncedKeywords, debouncedCategory]);

  const handleClickItem = (file: Models.Document) => {
    setOpen(false);
    setResults([]);

    const basePath = ["video", "audio"].includes(file.type)
      ? "media"
      : `${file.type}s`;
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (debouncedKeywords) params.set("keywords", debouncedKeywords);
    if (debouncedCategory) params.set("category", debouncedCategory);

    router.push(`/${basePath}?${params.toString()}`);
  };

  return (
    <div className="search">
      <div className="search-input-wrapper">
        <Image
          src="/assets/icons/search.svg"
          alt="Search"
          width={24}
          height={24}
        />
        <Input
          value={query}
          placeholder="Search..."
          className="search-input"
          onChange={(e) => setQuery(e.target.value)}
        />
        <Input
          value={keywordsText}
          placeholder="Keywords"
          className="search-input"
          onChange={(e) => setKeywordsText(e.target.value)}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="search-select"
        >
          <option value="">All Categories</option>
          <option value="Rapor">Rapor</option>
          <option value="Makale">Makale</option>
          <option value="Not">Not</option>
          <option value="Diğer">Diğer</option>
        </select>

        {open && (
          <ul className="search-result">
            {results.length > 0 ? (
              results.map((file) => (
                <li
                  key={file.$id}
                  className="flex items-center justify-between"
                  onClick={() => handleClickItem(file)}
                >
                  <div className="flex cursor-pointer items-center gap-4">
                    <Thumbnail
                      type={file.type}
                      extension={file.extension}
                      url={file.url}
                      className="size-9 min-w-9"
                    />
                    <p className="subtitle-2 line-clamp-1 text-light-100">
                      {file.name}
                    </p>
                  </div>

                  <FormattedDateTime
                    date={file.$createdAt}
                    className="caption line-clamp-1 text-light-200"
                  />
                </li>
              ))
            ) : (
              <p className="empty-result">No files found</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Search;
