import type { Module } from '../types';

interface SidebarProps {
  module: Module;
  setModule: (m: Module) => void;
}

export default function Sidebar({ module, setModule }: SidebarProps) {
  const isFeedback = module === 'feedback';
  const isAssistant = module === 'assistant';

  return (
    <aside
      style={{
        width: 264,
        flexShrink: 0,
        background: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        padding: '28px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: '#6366F1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          H
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>HR Toolkit</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Панель рекрутера</div>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <button
          onClick={() => setModule('feedback')}
          className={isFeedback ? '' : 'nav-btn is-inactive'}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '11px 13px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            background: isFeedback ? '#6366F1' : 'transparent',
            color: isFeedback ? '#FFFFFF' : '#374151',
          }}
        >
          Фидбек для кандидатов
        </button>
        <button
          onClick={() => setModule('assistant')}
          className={isAssistant ? '' : 'nav-btn is-inactive'}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '11px 13px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            background: isAssistant ? '#6366F1' : 'transparent',
            color: isAssistant ? '#FFFFFF' : '#374151',
          }}
        >
          Recruiter Assistant
        </button>
      </nav>

      <div style={{ marginTop: 'auto', padding: 12, background: '#F8F9FC', borderRadius: 12 }}>
        <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
          Все данные на этом экране — демонстрационные, реальных вызовов ATS/API нет.
        </div>
      </div>
    </aside>
  );
}
