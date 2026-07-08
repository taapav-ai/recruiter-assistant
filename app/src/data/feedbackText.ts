import { BLOCKED_PATTERNS, STAGE_LABELS, STAGE_LABELS_EN, STAGE_LABELS_UA } from './constants';
import type { Lang, Stage, Tone } from '../types';

export function countRiskyMentions(text: string): number {
  if (!text) return 0;
  let count = 0;
  BLOCKED_PATTERNS.forEach((re) => {
    if (re.test(text)) count += 1;
  });
  return count;
}

interface ToneTexts {
  body: string;
  closings: string[];
}

type LangTexts = Record<Tone, ToneTexts>;

export function buildFeedbackText(
  name: string,
  position: string,
  stage: Stage,
  tone: Tone,
  lang: Lang,
  variant: number,
): string {
  const idx = variant % 2;
  const stageLabel = lang === 'en' ? STAGE_LABELS_EN[stage] : lang === 'ua' ? STAGE_LABELS_UA[stage] : STAGE_LABELS[stage];

  const TEXTS: Record<Lang, LangTexts> = {
    ru: {
      neutral: {
        body: `Здравствуйте, ${name}!\n\nБлагодарим за участие в отборе на позицию «${position}». По итогам оценки на ${stageLabel} мы приняли решение продолжить с другим кандидатом, чей опыт на данный момент точнее соответствует требованиям роли.`,
        closings: [
          'Мы искренне ценим время, которое вы уделили процессу, и будем рады рассмотреть вашу кандидатуру на другие подходящие позиции в будущем.\n\nЖелаем успехов!',
          'Спасибо за проявленный интерес к нашей команде — будем рады видеть ваш отклик на другие открытые позиции.\n\nВсего наилучшего!',
        ],
      },
      warm: {
        body: `Здравствуйте, ${name}!\n\nСпасибо, что прошли с нами ${stageLabel} на позицию «${position}» — было приятно познакомиться с вашим опытом. По итогам обсуждения мы решили продолжить с кандидатом, чей профиль немного точнее совпал с требованиями роли на этом этапе.`,
        closings: [
          'Это решение ни в коей мере не умаляет вашу квалификацию, и мы будем рады видеть ваш отклик на другие позиции в нашей компании.\n\nСпасибо за уделённое время и удачи в поиске!',
          'Пожалуйста, не воспринимайте это как оценку ваших навыков — будем рады новой встрече, если появится подходящая роль.\n\nВсего доброго и удачи!',
        ],
      },
      brief: {
        body: `Здравствуйте, ${name}.\n\nПо итогам оценки на ${stageLabel} на позицию «${position}» мы приняли решение двигаться с другим кандидатом.`,
        closings: ['Спасибо за уделённое время.', 'Благодарим за отклик и уделённое время.'],
      },
    },
    en: {
      neutral: {
        body: `Hi ${name},\n\nThank you for taking part in our process for the ${position} role. After the ${stageLabel}, we've decided to move forward with another candidate whose experience more closely matches the current requirements of the role.`,
        closings: [
          "We truly appreciate the time you invested, and we'd welcome your application for other suitable roles in the future.\n\nWishing you the best of luck!",
          "Thank you for your interest in joining our team — we'd love to see you apply for other open roles.\n\nAll the best!",
        ],
      },
      warm: {
        body: `Hi ${name},\n\nThank you for going through the ${stageLabel} with us for the ${position} role — it was great getting to know your background. After careful consideration, we've decided to move forward with a candidate whose profile aligned slightly more closely with the role's requirements at this stage.`,
        closings: [
          "This decision doesn't reflect on your skills or potential, and we'd love to see you apply again for future roles with us.\n\nThank you again, and best of luck!",
          "Please don't take this as a reflection of your abilities — we hope to cross paths again if a fitting role opens up.\n\nAll the best to you!",
        ],
      },
      brief: {
        body: `Hi ${name},\n\nAfter the ${stageLabel} for the ${position} role, we've decided to move forward with another candidate.`,
        closings: ['Thank you for your time.', 'Thanks again for applying and for your time.'],
      },
    },
    ua: {
      neutral: {
        body: `Вітаємо, ${name}!\n\nДякуємо за участь у відборі на позицію «${position}». За підсумками оцінки на ${stageLabel} ми вирішили продовжити роботу з іншим кандидатом, чий досвід наразі точніше відповідає вимогам ролі.`,
        closings: [
          'Ми щиро цінуємо час, який ви приділили процесу, і будемо раді розглянути вашу кандидатуру на інші відповідні позиції у майбутньому.\n\nБажаємо успіхів!',
          'Дякуємо за інтерес до нашої команди — будемо раді бачити ваш відгук на інші відкриті позиції.\n\nВсього найкращого!',
        ],
      },
      warm: {
        body: `Вітаємо, ${name}!\n\nДякуємо, що пройшли з нами ${stageLabel} на позицію «${position}» — було приємно дізнатися більше про ваш досвід. За результатами обговорення ми вирішили продовжити з кандидатом, чий профіль трохи точніше збігся з вимогами ролі на цьому етапі.`,
        closings: [
          'Це рішення жодним чином не применшує вашу кваліфікацію, і ми будемо раді бачити ваш відгук на інші позиції в нашій компанії.\n\nДякуємо за приділений час і успіхів у пошуку!',
          'Будь ласка, не сприймайте це як оцінку ваших навичок — будемо раді новій зустрічі, якщо з’явиться відповідна роль.\n\nВсього доброго та успіхів!',
        ],
      },
      brief: {
        body: `Вітаємо, ${name}.\n\nЗа підсумками оцінки на ${stageLabel} на позицію «${position}» ми вирішили рухатися з іншим кандидатом.`,
        closings: ['Дякуємо за приділений час.', 'Дякуємо за відгук і приділений час.'],
      },
    },
  };

  const set = TEXTS[lang][tone];
  return `${set.body}\n\n${set.closings[idx]}`;
}
