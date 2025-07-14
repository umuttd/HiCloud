"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { Models } from "node-appwrite";
import { actionsDropdownItems } from "@/constants";
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  deleteFile,
  renameFile,
  updateFileUsers,
} from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";
import { FileDetails, ShareInput } from "@/components/ActionsModalContent";
import { useToast } from "@/hooks/use-toast";

export type ActionType = { value: string; label: string; icon?: string };

// Her işlem geriye void olarak tamamlanır
type ActionHandler = () => Promise<void>;

const ActionDropdown = ({ file }: { file: Models.Document }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [name, setName] = useState(file.name);
  const [emails, setEmails] = useState<string[]>([]);
  const path = usePathname() ?? "";
  const { toast } = useToast();

  const closeAll = () => {
    setIsModalOpen(false);
    setAction(null);
    setName(file.name);
    setEmails([]);
    setIsLoading(false);
  };

  const handleAction = async () => {
    if (!action) return;
    setIsLoading(true);
    try {
      const actionsMap: Record<string, ActionHandler> = {
        rename: async () => {
          await renameFile({
            fileId: file.$id,
            name,
            extension: file.extension,
            path,
          });
        },
        share: async () => {
          await updateFileUsers({ fileId: file.$id, emails, path });
        },
        delete: async () => {
          await deleteFile({
            fileId: file.$id,
            bucketFileId: file.bucketFileId,
            path,
          });
        },
      };

      await actionsMap[action.value]();
      toast({ description: `${action.label} işlemi başarılı.` });
      closeAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`❌ ${action?.value} error:`, msg);
      toast({
        description: `${action?.label} hatası: ${msg}`,
        className: "error-toast",
      });
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (email: string) => {
    const updated = emails.filter((e) => e !== email);
    try {
      await updateFileUsers({ fileId: file.$id, emails: updated, path });
      setEmails(updated);
      toast({ description: "Kullanıcı başarıyla kaldırıldı." });
      closeAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("❌ remove user error:", msg);
      toast({ description: `Hata: ${msg}`, className: "error-toast" });
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      // relative path kullanmak genelde daha güvenli:
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: file.$id }),
      });
      const data = await res.json();
      console.log("🛰️ analyze response:", res.status, data);

      if (!res.ok) {
        throw new Error(data.error || res.statusText);
      }

      toast({ description: "AI analiz başarıyla tetiklendi." });
      closeAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("❌ analyze error:", msg);
      toast({ description: `Analiz hatası: ${msg}`, className: "error-toast" });
      setIsLoading(false);
    }
  };

  const renderDialogContent = () => {
    if (!action) return null;
    const { value, label } = action;

    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>

        {/* Rename */}
        {value === "rename" && (
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        {/* Details with Analyze */}
        {value === "details" && (
          <>
            <FileDetails file={file} />
            <DialogFooter>
              <Button onClick={handleAnalyze} disabled={isLoading}>
                {isLoading ? "Analiz Ediliyor..." : "Analiz Et"}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Share */}
        {value === "share" && (
          <ShareInput
            file={file}
            onInputChange={setEmails}
            onRemove={handleRemoveUser}
          />
        )}

        {/* Delete Confirmation */}
        {value === "delete" && (
          <p>
            Are you sure you want to delete <strong>{file.name}</strong>?
          </p>
        )}

        {/* Footer for rename, share, delete */}
        {["rename", "share", "delete"].includes(value) && (
          <DialogFooter>
            <Button onClick={closeAll}>Cancel</Button>
            <Button onClick={handleAction} disabled={isLoading}>
              {isLoading ? (
                <Image
                  src="/assets/icons/loader.svg"
                  width={20}
                  height={20}
                  alt=""
                />
              ) : (
                <span>{label}</span>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Image
            src="/assets/icons/dots.svg"
            alt="actions"
            width={24}
            height={24}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{file.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map((item) => (
            <DropdownMenuItem
              key={item.value}
              onClick={() => {
                setAction(item);
                setIsModalOpen(true);
              }}
            >
              {item.value === "download" ? (
                <Link href={constructDownloadUrl(file.bucketFileId)} download>
                  <Image
                    src={item.icon!}
                    alt={item.label}
                    width={16}
                    height={16}
                  />{" "}
                  {item.label}
                </Link>
              ) : (
                <span>
                  <Image
                    src={item.icon!}
                    alt={item.label}
                    width={16}
                    height={16}
                  />{" "}
                  {item.label}
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {renderDialogContent()}
    </Dialog>
  );
};

export default ActionDropdown;
