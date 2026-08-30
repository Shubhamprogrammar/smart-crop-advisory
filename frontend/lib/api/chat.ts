import { apiClient, unwrap } from "@/lib/apiClient";

export interface Chat {
  id: string;
  farm?: string;
  title?: string;
  language: string;
  lastMessageAt?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  chat: string;
  sender: "user" | "assistant";
  content: string;
  language: string;
  sources?: { documentId: string; title: string }[];
  createdAt: string;
}

export async function listChats(): Promise<{ chats: Chat[] }> {
  return unwrap(apiClient.get("/api/chat"));
}

export async function createChat(input: { farmId?: string; language?: string }): Promise<{ chat: Chat }> {
  return unwrap(apiClient.post("/api/chat", input));
}

export async function getMessages(chatId: string): Promise<{ messages: ChatMessage[] }> {
  return unwrap(apiClient.get(`/api/chat/${chatId}/messages`));
}

export async function sendMessage(
  chatId: string,
  content: string
): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> {
  return unwrap(apiClient.post(`/api/chat/${chatId}/messages`, { content }));
}
