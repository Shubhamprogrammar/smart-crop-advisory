import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { sanitizeChat, sanitizeChatMessage } from "../utils/sanitizeChat";
import * as chatService from "../services/chat.service";
import { CreateChatInput, SendMessageInput } from "../validators/chat.validator";

export async function createChat(req: Request, res: Response) {
  const input = req.body as CreateChatInput;
  const chat = await chatService.createChat(req.user!.id, input);
  return sendSuccess(res, { message: "Chat created", data: { chat: sanitizeChat(chat) }, statusCode: 201 });
}

export async function listChats(req: Request, res: Response) {
  const chats = await chatService.listChats(req.user!.id);
  return sendSuccess(res, { message: "Chats fetched", data: { chats: chats.map(sanitizeChat) } });
}

export async function getMessages(req: Request, res: Response) {
  const messages = await chatService.getMessages(req.params.chatId, req.user!.id);
  return sendSuccess(res, { message: "Messages fetched", data: { messages: messages.map(sanitizeChatMessage) } });
}

export async function sendMessage(req: Request, res: Response) {
  const { content } = req.body as SendMessageInput;
  const { userMessage, assistantMessage } = await chatService.sendMessage(
    req.params.chatId,
    req.user!.id,
    content
  );
  return sendSuccess(res, {
    message: "Message sent",
    data: {
      userMessage: sanitizeChatMessage(userMessage),
      assistantMessage: sanitizeChatMessage(assistantMessage),
    },
    statusCode: 201,
  });
}
