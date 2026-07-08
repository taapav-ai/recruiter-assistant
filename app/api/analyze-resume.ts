import type { VercelRequest, VercelResponse } from '@vercel/node';
import multer from 'multer';
import Anthropic from '@anthropic-ai/sdk';

export const config = {
  maxDuration: 30,
};

const anthropic = new Anthropic();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const RESUME_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Полное имя кандидата' },
    position: { type: 'string', description: 'Текущая или последняя позиция кандидата' },
    experience: { type: 'integer', description: 'Количество лет опыта' },
    skills: {
      type: 'array',
      items: { type: 'string' },
      description: 'Ключевые технические и профессиональные навыки, 4-6 штук',
    },
    summary: { type: 'string', description: 'Краткое summary на 2-3 предложения на русском языке' },
    scores: {
      type: 'object',
      properties: {
        frontend: { type: 'integer', description: 'Оценка соответствия вакансии Frontend разработчик, 0-100' },
        product: { type: 'integer', description: 'Оценка соответствия вакансии Product Manager, 0-100' },
        data: { type: 'integer', description: 'Оценка соответствия вакансии Data-аналитик, 0-100' },
      },
      required: ['frontend', 'product', 'data'],
      additionalProperties: false,
    },
    pros: {
      type: 'array',
      items: { type: 'string' },
      description: 'Сильные стороны кандидата, 2-3 пункта, на русском',
    },
    risks: {
      type: 'array',
      items: { type: 'string' },
      description: 'Зоны риска / пробелы, 1-2 пункта, на русском',
    },
    interviewQuestions: {
      type: 'array',
      items: { type: 'string' },
      description: 'Ровно 5 вопросов для интервью, адаптированных под опыт и навыки кандидата, на русском',
    },
  },
  required: ['name', 'position', 'experience', 'skills', 'summary', 'scores', 'pros', 'risks', 'interviewQuestions'],
  additionalProperties: false,
};

const ANALYSIS_PROMPT = `Ты — ассистент рекрутера. Проанализируй приложенное резюме кандидата (PDF) и верни структурированное досье.

Оцени соответствие кандидата сразу трём вакансиям (поле scores, каждое значение 0-100):
- frontend: Frontend разработчик
- product: Product Manager
- data: Data-аналитик

Верни только те данные, которые можно обоснованно извлечь или оценить из резюме. Пиши summary, pros, risks и interviewQuestions на русском языке.`;

function parseMultipart(req: VercelRequest, res: VercelResponse): Promise<void> {
  return new Promise((resolve, reject) => {
    upload.single('resume')(req as never, res as never, (err: unknown) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await parseMultipart(req, res);
  } catch {
    res.status(400).json({ error: 'Не удалось обработать загруженный файл.' });
    return;
  }

  const file = (req as unknown as { file?: Express.Multer.File }).file;

  if (!file) {
    res.status(400).json({ error: 'Файл резюме не найден в запросе.' });
    return;
  }
  if (file.mimetype !== 'application/pdf') {
    res.status(400).json({ error: 'Поддерживаются только PDF-файлы.' });
    return;
  }

  try {
    const base64 = file.buffer.toString('base64');

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: base64 },
            },
            { type: 'text', text: ANALYSIS_PROMPT },
          ],
        },
      ],
      output_config: {
        format: { type: 'json_schema', schema: RESUME_SCHEMA },
      },
    });

    if (response.stop_reason === 'refusal') {
      res.status(422).json({ error: 'Не удалось проанализировать резюме — запрос отклонён моделью.' });
      return;
    }

    const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === 'text');
    if (!textBlock) {
      res.status(502).json({ error: 'Модель не вернула результат анализа.' });
      return;
    }

    const parsed = JSON.parse(textBlock.text);
    res.status(200).json(parsed);
  } catch (err) {
    console.error('Resume analysis failed:', err);
    res.status(502).json({ error: 'Не удалось проанализировать резюме. Попробуйте ещё раз.' });
  }
}
