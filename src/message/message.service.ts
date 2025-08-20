import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async create(dto: CreateMessageDto) {
    const { content, userId, isBot = false } = dto;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return this.prisma.message.create({
      data: {
        content,
        userId,
        isBot,
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.message.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async askGemini(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    const url =
      'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';

    const markdownPrompt = `${prompt}\n\nResponda usando Markdown.`;

    const payload = {
      contents: [
        {
          parts: [{ text: markdownPrompt }],
        },
      ],
    };

    const headers = {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    };

    interface GeminiApiResponse {
      candidates?: {
        content?: {
          parts?: { text?: string }[];
        };
      }[];
    }

    const response = await firstValueFrom(
      this.httpService.post<GeminiApiResponse>(url, payload, { headers }),
    );

    const text =
      response.data.candidates &&
      response.data.candidates[0] &&
      response.data.candidates[0].content &&
      response.data.candidates[0].content.parts &&
      response.data.candidates[0].content.parts[0] &&
      response.data.candidates[0].content.parts[0].text;

    return text || 'Erro ao obter resposta da IA';
  }

  async sendUserAndBotMessage(
    dto: CreateMessageDto,
  ): Promise<{ userMessage: any; botMessage: any }> {
    if (!dto.content || !dto.userId) {
      throw new Error('Conteúdo e userId são obrigatórios');
    }

    // Verifica se o usuário existe
    const userExists = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!userExists) {
      throw new Error('Usuário não encontrado');
    }

    // Cria a mensagem do usuário
    const userMessage = await this.create({
      ...dto,
      isBot: false,
    });

    // Gera resposta do bot
    const botContent = await this.askGemini(dto.content);

    // Cria a mensagem do bot
    const botMessage = await this.create({
      content: botContent,
      userId: dto.userId,
      isBot: true,
    });

    return { userMessage, botMessage };
  }

  async getUserMessages(userId: string) {
    if (!userId) {
      throw new Error('userId é obrigatório');
    }

    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExists) {
      throw new Error('Usuário não encontrado');
    }

    const messages = await this.findByUser(userId);
    if (!messages.length) {
      throw new Error('Nenhuma mensagem encontrada');
    }
    return messages;
  }
}
