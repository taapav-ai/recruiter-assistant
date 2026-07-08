import type { Candidate, Lang, Option, Stage, Tone, Vacancy } from '../types';

export const STAGE_LABELS: Record<Stage, string> = {
  resume: 'этапе рассмотрения резюме',
  screening: 'этапе скрининга',
  test: 'этапе тестового задания',
  interview: 'этапе интервью',
  final: 'финальном этапе',
};

export const STAGE_LABELS_EN: Record<Stage, string> = {
  resume: 'resume review stage',
  screening: 'screening stage',
  test: 'take-home task stage',
  interview: 'interview stage',
  final: 'final stage',
};

export const STAGE_LABELS_UA: Record<Stage, string> = {
  resume: 'етапі розгляду резюме',
  screening: 'етапі скринінгу',
  test: 'етапі тестового завдання',
  interview: 'етапі співбесіди',
  final: 'фінальному етапі',
};

export const STAGE_OPTIONS: Option<Stage>[] = [
  { value: 'resume', label: 'Резюме' },
  { value: 'screening', label: 'Скрининг' },
  { value: 'test', label: 'Тестовое задание' },
  { value: 'interview', label: 'Интервью' },
  { value: 'final', label: 'Финал' },
];

export const TONE_OPTIONS: Option<Tone>[] = [
  { value: 'neutral', label: 'Нейтральный' },
  { value: 'warm', label: 'Тёплый' },
  { value: 'brief', label: 'Краткий' },
];

export const LANG_OPTIONS: Option<Lang>[] = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
  { value: 'ua', label: 'Українська' },
];

export const BLOCKED_PATTERNS: RegExp[] = [
  /возраст/i, /беремен/i, /замуж/i, /женат/i, /развед/i,
  /национальн/i, /вероисповед/i, /религ/i, /инвалид/i, /здоровь/i, /ориентац/i, /\bвік\b/i,
  /національ/i, /релігі/i, /pregnant/i, /married/i, /divorce/i, /\bage\b/i,
  /disability/i, /nationality/i, /religion/i, /\brace\b/i, /ethnic/i,
];

export const VACANCIES: Vacancy[] = [
  { id: 'frontend', label: 'Frontend разработчик' },
  { id: 'product', label: 'Product Manager' },
  { id: 'data', label: 'Data-аналитик' },
];

export const CANDIDATES_SEED: Candidate[] = [
  {
    id: 'cand1', name: 'Анна Ковалёва', position: 'Frontend разработчик', experience: 5,
    skills: ['React', 'TypeScript', 'CSS/SCSS', 'Redux', 'Next.js'],
    summary: 'Frontend-разработчик с 5-летним опытом создания высоконагруженных SPA. Сильна в архитектуре компонентов и оптимизации производительности. Есть опыт менторства junior-разработчиков.',
    scores: { frontend: 92, product: 38, data: 30 },
    pros: ['Глубокая экспертиза в React-экосистеме', 'Опыт работы с высоконагруженными продуктами', 'Хорошие коммуникативные навыки, опыт менторства'],
    risks: ['Нет опыта мобильной разработки', 'Ограниченный опыт бэкенд-интеграций'],
  },
  {
    id: 'cand2', name: 'Дмитрий Орлов', position: 'Product Manager', experience: 7,
    skills: ['Product Discovery', 'Roadmapping', 'A/B-тесты', 'SQL', 'Аналитика'],
    summary: 'Продуктовый менеджер с опытом запуска и роста B2C-продуктов. Сильные аналитические навыки и опыт работы с кросс-функциональными командами.',
    scores: { frontend: 20, product: 88, data: 55 },
    pros: ['Сильное стратегическое мышление', 'Опыт запуска продуктов с нуля', 'Хорошее владение данными'],
    risks: ['Мало опыта в enterprise B2B', 'Смена работы каждые ~1.5 года'],
  },
  {
    id: 'cand3', name: 'Мария Соколова', position: 'Data-аналитик', experience: 3,
    skills: ['SQL', 'Python', 'Tableau', 'A/B-тесты', 'Статистика'],
    summary: 'Data-аналитик с опытом построения дашбордов и проведения экспериментов. Уверенно работает с большими массивами данных, есть база в статистике.',
    scores: { frontend: 15, product: 45, data: 81 },
    pros: ['Сильные технические навыки в SQL/Python', 'Опыт самостоятельного проведения A/B-тестов'],
    risks: ['Небольшой опыт презентаций топ-менеджменту', 'Нет опыта data-инженерии'],
  },
];
