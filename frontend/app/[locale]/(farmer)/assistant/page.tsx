"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as chatApi from "@/lib/api/chat";
import { useFarmStore } from "@/store/farmStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";

export default function AssistantPage() {
  const t = useTranslations("assistant");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const selectedFarmId = useFarmStore((s) => s.selectedFarmId);
  const [chatId, setChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const createChatMutation = useMutation({
    mutationFn: () => chatApi.createChat({ farmId: selectedFarmId ?? undefined, language: locale }),
    onSuccess: ({ chat }) => setChatId(chat.id),
  });

  useEffect(() => {
    if (!chatId) createChatMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: messagesData } = useQuery({
    queryKey: ["chat", "messages", chatId],
    queryFn: () => chatApi.getMessages(chatId!),
    enabled: !!chatId,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => chatApi.sendMessage(chatId!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "messages", chatId] });
      setInput("");
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || !chatId) return;
    sendMutation.mutate(input.trim());
  }

  return (
    <div className="flex h-full flex-col">
      <h1 className="mb-3 text-xl font-semibold text-foreground">{t("title")}</h1>

      <div className="flex-1 space-y-3 overflow-y-auto pb-3">
        {!chatId && (
          <div className="flex justify-center py-8">
            <Spinner className="text-primary" />
          </div>
        )}
        {messagesData?.messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-card px-4 py-2 text-sm ${
                m.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {sendMutation.isPending && (
          <div className="flex justify-start">
            <div className="rounded-card bg-muted px-4 py-2 text-sm text-foreground/50">{t("thinking")}</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border pt-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          disabled={!chatId || sendMutation.isPending}
        />
        <Button type="submit" disabled={!chatId || !input.trim() || sendMutation.isPending}>
          {t("send")}
        </Button>
      </form>
    </div>
  );
}
