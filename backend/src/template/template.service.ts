import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';
import { GenerateTemplateDto } from './dtos/generate-template.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class TemplateService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async generateIntroduction(dto: GenerateTemplateDto) {
    const { dishId, context } = dto;

    // 1. Lấy thông tin món
    const dish = await this.prisma.dishes.findUnique({
      where: { id: dishId },
      include: { category: true, region: true },
    });

    if (!dish) {
      throw new BadRequestException('Dish not found');
    }

    // 2. Xử lý taste level
    const tasteDescription = [
      dish.spiciness_level ? `辛さ${dish.spiciness_level}/5` : null,
      dish.saltiness_level ? `塩味${dish.saltiness_level}/5` : null,
      dish.sweetness_level ? `甘さ${dish.sweetness_level}/5` : null,
      dish.sourness_level ? `酸味${dish.sourness_level}/5` : null,
    ]
      .filter(Boolean)
      .join('、');

    // 3. Build prompt
    const prompt = `
あなたはベトナムの学生です。ベトナム料理を日本人の先生に口頭で紹介する文章を作ります。
以下の料理情報と紹介したいシーン(context)をもとに、自然な会話調で作ってください。
※Nếu có nguyên liệu (原材料), cách ăn (食べ方), loại món (カテゴリー) hoặc vùng miền (地域) thì hãy giới thiệu trong câu giới thiệu.

【料理情報】
料理名: ${dish.name_japanese}
カテゴリー: ${dish.category?.name_japanese ?? 'なし'}
地域: ${dish.region?.name_japanese ?? 'なし'}
味の特徴: ${tasteDescription || '特になし'}
説明文: ${dish.description_japanese ?? '説明なし'}
原材料: ${dish.ingredients ?? 'なし'}
食べ方: ${dish.how_to_eat ?? 'なし'}
※味のレベルはすべて5段階です。
${context}

【要件】
- Trả về duy nhất 1 JSON, KHÔNG có ký tự thừa
- Cấu trúc JSON:
{
  "generatedTextJa": "...",
  "generatedTextVi": "..."
}
- "generatedTextJa": Nhật 80〜150文字, hội thoại tự nhiên
- "generatedTextVi": tiếng Việt dễ hiểu, giống sinh viên giới thiệu món ăn cho thầy
`;

    // 4. Gọi OpenAI với response_format JSON CHUẨN
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4.1',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      let output = completion.choices?.[0]?.message?.content;

      if (!output) {
        output = '';
      }
      let parsedJSON: { generatedTextJa: string; generatedTextVi: string };

      try {
        parsedJSON = JSON.parse(output);
      } catch (e) {
        console.error('JSON parse error:', output);
        throw new InternalServerErrorException('AI output is not valid JSON');
      }

      // 5. Tạo audio từ generatedTextJa
      const audioResponse = await this.openai.audio.speech.create({
        model: 'gpt-4o-mini-tts',
        voice: 'alloy',
        input: parsedJSON.generatedTextJa,
      });

      const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());

      const audioUrl = await this.uploadService.uploadTemplateAudio(
        audioBuffer,
        dish.id,
      );

      // 6. Trả kết quả
      return {
        dishId: dish.id,
        dishNameJapanese: dish.name_japanese,
        dishNameVietnamese: dish.name_vietnamese,
        audio_url: audioUrl,
        generated_text_ja: parsedJSON.generatedTextJa,
        generated_text_vi: parsedJSON.generatedTextVi,
      };
    } catch (err) {
      console.error('OpenAI error:', err);
      throw new InternalServerErrorException('Failed to generate introduction');
    }
  }

  // 29: Lưu template
  async saveTemplate(
    userId: number,
    dishId: number,
    generated_text_ja: string,
    generated_text_vi: string,
    title?: string,
    context?: string,
    audio_url?: string,
  ) {
    if (!dishId || !generated_text_ja || !generated_text_vi) {
      throw new BadRequestException(
        'dishId, generatedTextJa and generatedTextVi are required',
      );
    }

    return this.prisma.saved_templates.create({
      data: {
        user_id: userId,
        dish_id: dishId,
        generated_text_ja,
        generated_text_vi,
        title: title ?? null,
        context: context ?? null,
        audio_url: audio_url ?? null,
      },
      include: { dish: true },
    });
  }

  // 30: Lấy template đã lưu của user
  async getSavedTemplates(userId: number) {
    return this.prisma.saved_templates.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        dish: true,
      },
    });
  }

  // 31: Xóa template
  async deleteTemplate(userId: number, templateId: number) {
    const template = await this.prisma.saved_templates.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.user_id !== userId) {
      throw new BadRequestException(
        'You are not allowed to delete this template',
      );
    }

    await this.prisma.saved_templates.delete({
      where: { id: templateId },
    });

    return { message: 'Template deleted successfully' };
  }
}
