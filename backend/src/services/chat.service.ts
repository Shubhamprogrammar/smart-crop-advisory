import { Chat, IChat } from "../models/Chat.model";
import { ChatMessage, IChatMessage } from "../models/ChatMessage.model";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { getOwnedFarmOrThrow } from "./farm.service";
import { buildFarmContext } from "./chatContext.service";
import { requestChatReply, ChatHistoryMessage } from "./aiClient.service";
import { CreateChatInput } from "../validators/chat.validator";

const HISTORY_MESSAGE_LIMIT = 6;
const UNAVAILABLE_REPLY =
  "Sorry, I'm temporarily unable to answer right now. Please try again in a moment, or use \"Ask Expert\" for urgent questions.";

export async function createChat(userId: string, input: CreateChatInput): Promise<IChat> {
  if (input.farmId) {
    await getOwnedFarmOrThrow(input.farmId, userId);
  }

  return Chat.create({
    user: userId,
    farm: input.farmId,
    language: input.language ?? "en",
  });
}

async function getOwnedChatOrThrow(chatId: string, userId: string): Promise<IChat> {
  const chat = await Chat.findOne({ _id: chatId, user: userId });
  if (!chat) {
    throw ApiError.notFound("Chat not found");
  }
  return chat;
}

export async function listChats(userId: string): Promise<IChat[]> {
  return Chat.find({ user: userId }).sort({ updatedAt: -1 });
}

export async function getMessages(chatId: string, userId: string): Promise<IChatMessage[]> {
  await getOwnedChatOrThrow(chatId, userId);
  return ChatMessage.find({ chat: chatId }).sort({ createdAt: 1 });
}

export async function sendMessage(
  chatId: string,
  userId: string,
  content: string
): Promise<{ userMessage: IChatMessage; assistantMessage: IChatMessage }> {
  const chat = await getOwnedChatOrThrow(chatId, userId);

  const priorMessages = await ChatMessage.find({ chat: chatId })
    .sort({ createdAt: -1 })
    .limit(HISTORY_MESSAGE_LIMIT);
  const history: ChatHistoryMessage[] = priorMessages
    .reverse()
    .map((m) => ({ role: m.sender, content: m.content }));

  const userMessage = await ChatMessage.create({
    chat: chatId,
    sender: "user",
    content,
    language: chat.language,
  });

  const context = chat.farm ? await buildFarmContext(chat.farm.toString(), userId) : "";

  const aiResult = await requestChatReply({
    question: content,
    language: chat.language,
    context,
    history,
  });

  const answer = aiResult.ok ? aiResult.data.answer : UNAVAILABLE_REPLY;
  if (!aiResult.ok) {
    logger.warn("Chat AI call failed, saving graceful fallback reply", { chatId, reason: aiResult.reason });
  }

  const assistantMessage = await ChatMessage.create({
    chat: chatId,
    sender: "assistant",
    content: answer,
    contextSnapshot: context ? { context } : undefined,
    language: chat.language,
  });

  chat.lastMessageAt = new Date();
  if (!chat.title) {
    chat.title = content.length > 60 ? content.slice(0, 57) + "..." : content;
  }
  await chat.save();

  return { userMessage, assistantMessage };
}
