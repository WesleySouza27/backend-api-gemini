import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MessageService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async create(content: string, userId: string, isBot = false) {
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
}
