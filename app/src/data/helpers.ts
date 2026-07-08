import type { Candidate } from '../types';

export function scoreColor(score: number): string {
  if (score >= 75) return '#10B981';
  if (score >= 50) return '#F59E0B';
  return '#9CA3AF';
}

export function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
}

export function buildQuestions(candidate: Candidate): string[] {
  const skillA = candidate.skills[0] || 'ключевых инструментов';
  const skillB = candidate.skills[1] || 'смежных технологий';
  return [
    `Расскажите подробнее о вашем опыте работы с ${skillA} — на каких проектах вы его применяли?`,
    `Как вы обычно подходите к использованию ${skillB} в повседневной работе?`,
    `Опишите самый сложный проект за последние ${candidate.experience > 3 ? '2 года' : 'год'} — какой была ваша роль и какого результата удалось достичь?`,
    `Что для вас является приоритетом при выборе следующего места работы?`,
    `Как вы обычно выстраиваете коммуникацию с кросс-функциональными командами (продукт, дизайн, разработка)?`,
  ];
}
