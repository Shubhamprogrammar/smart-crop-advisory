"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as knowledgeApi from "@/lib/api/knowledge";
import { ApiRequestError } from "@/lib/apiClient";
import { Card, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function statusTone(status: string): "success" | "warning" | "danger" | "neutral" {
  if (status === "ready") return "success";
  if (status === "pending") return "warning";
  if (status === "failed") return "danger";
  return "neutral";
}

export default function AdminKnowledgePage() {
  const t = useTranslations("admin");
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<knowledgeApi.KnowledgeCategory>("crop_cultivation");
  const [language, setLanguage] = useState<"en" | "hi" | "mr" | "gu">("en");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "knowledge"],
    queryFn: () => knowledgeApi.listDocuments(),
  });

  const createMutation = useMutation({
    mutationFn: () => knowledgeApi.createDocument({ title, category, language, text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "knowledge"] });
      setTitle("");
      setText("");
      setShowForm(false);
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : t("genericError")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => knowledgeApi.deleteDocument(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "knowledge"] }),
  });

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{t("knowledge")}</h1>
        <Button variant="outline" onClick={() => setShowForm((s) => !s)}>
          {showForm ? t("cancel") : `+ ${t("addDocument")}`}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardTitle>{t("addDocument")}</CardTitle>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
            className="mt-3 flex flex-col gap-3"
          >
            {error && <p className="text-sm text-danger">{error}</p>}
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("documentTitle")} required />
            <div className="flex flex-wrap gap-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as knowledgeApi.KnowledgeCategory)}
                className="min-h-11 rounded-card border border-border bg-white px-3 text-sm"
              >
                {knowledgeApi.KNOWLEDGE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as typeof language)}
                className="min-h-11 rounded-card border border-border bg-white px-3 text-sm"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="mr">मराठी</option>
                <option value="gu">ગુજરાતી</option>
              </select>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("documentText")}
              rows={6}
              required
              minLength={50}
              className="w-full rounded-card border border-border bg-white p-3 text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "…" : t("save")}
            </Button>
          </form>
        </Card>
      )}

      {isLoading && <Spinner className="text-primary" />}

      <div className="flex flex-col gap-3">
        {data?.documents.map((doc) => (
          <Card key={doc.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{doc.title}</p>
                <p className="mt-1 text-xs text-foreground/50">
                  {doc.category} · {doc.language} · {doc.chunkCount ?? 0} {t("chunks")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={statusTone(doc.status)}>{doc.status}</Badge>
                <button
                  onClick={() => deleteMutation.mutate(doc.id)}
                  disabled={deleteMutation.isPending}
                  className="text-xs font-medium text-danger disabled:opacity-40"
                >
                  {t("delete")}
                </button>
              </div>
            </div>
          </Card>
        ))}
        {data?.documents.length === 0 && (
          <Card>
            <p className="text-sm text-foreground/50">{t("noData")}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
