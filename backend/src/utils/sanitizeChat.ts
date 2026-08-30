import { IChat } from "../models/Chat.model";
import { IChatMessage } from "../models/ChatMessage.model";

export function sanitizeChat(chat: IChat) {
  return {
    id: chat._id.toString(),
    farm: chat.farm?.toString(),
    title: chat.title,
    language: chat.language,
    lastMessageAt: chat.lastMessageAt,
    createdAt: chat.createdAt,
  };
}

export function sanitizeChatMessage(message: IChatMessage) {
  return {
    id: message._id.toString(),
    chat: message.chat.toString(),
    sender: message.sender,
    content: message.content,
    language: message.language,
    sources: message.ragSources?.map((s) => ({ documentId: s.documentId.toString(), title: s.title })),
    createdAt: message.createdAt,
  };
}
