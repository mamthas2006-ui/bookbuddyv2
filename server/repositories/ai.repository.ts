import { prisma } from "../config/prisma";
import { ChatMessage } from "../services/ai.service";

export class AIRepository {
  async getConversation(id: string, userId: string) {
    return prisma.aIConversation.findFirst({
      where: { id, userId },
    });
  }

  async createConversation(userId: string, initialMessage: ChatMessage) {
    return prisma.aIConversation.create({
      data: {
        userId,
        title: initialMessage.content.substring(0, 40) + "...",
        messages: [initialMessage] as any,
      },
    });
  }

  async appendMessages(conversationId: string, messages: ChatMessage[]) {
    const conv = await prisma.aIConversation.findUnique({
      where: { id: conversationId },
    });
    const current = (conv?.messages as unknown as ChatMessage[]) || [];
    const updated = [...current, ...messages];

    return prisma.aIConversation.update({
      where: { id: conversationId },
      data: { messages: updated as any },
    });
  }
}
