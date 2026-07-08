import type { ChangeEvent, CSSProperties } from 'react';
import { LANG_OPTIONS, STAGE_OPTIONS, TONE_OPTIONS } from '../data/constants';
import type { FeedbackResult, HistoryItem, Lang, Stage, Tone } from '../types';

const fieldLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#6B7280',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: 6,
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #E5E7EB',
  borderRadius: 10,
  fontSize: 14,
  color: '#1E1E2E',
  background: '#F9FAFB',
  outline: 'none',
};

interface FeedbackModuleProps {
  fbName: string;
  fbPosition: string;
  fbStage: Stage;
  fbReason: string;
  fbTone: Tone;
  fbLang: Lang;
  onFbNameChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onFbPositionChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onFbStageChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onFbReasonChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onFbToneChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onFbLangChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  cannotGenerate: boolean;
  generateFeedback: () => void;
  feedbackResult: FeedbackResult | null;
  copyState: 'copied' | null;
  atsState: 'sent' | null;
  copyFeedback: () => void;
  regenerateFeedback: () => void;
  sendToAts: () => void;
  history: HistoryItem[];
}

export default function FeedbackModule({
  fbName, fbPosition, fbStage, fbReason, fbTone, fbLang,
  onFbNameChange, onFbPositionChange, onFbStageChange, onFbReasonChange, onFbToneChange, onFbLangChange,
  cannotGenerate, generateFeedback,
  feedbackResult, copyState, atsState, copyFeedback, regenerateFeedback, sendToAts,
  history,
}: FeedbackModuleProps) {
  const hasRiskFlag = !!(feedbackResult && feedbackResult.flaggedCount > 0);
  const copyLabel = copyState === 'copied' ? 'Скопировано ✓' : 'Скопировать';
  const copyColor = copyState === 'copied' ? '#10B981' : '#374151';
  const atsLabel = atsState === 'sent' ? 'Отправлено ✓' : 'Отправить в ATS';

  return (
    <div style={{ maxWidth: 1120 }}>
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
          Генератор обратной связи кандидатам
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
          Сформируйте корректный и юридически безопасный отказ за несколько секунд.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div
          style={{
            flex: 1,
            minWidth: 340,
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
          }}
        >
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={fieldLabelStyle}>Имя кандидата</label>
              <input
                style={inputStyle}
                placeholder="Например, Иван Петров"
                value={fbName}
                onChange={onFbNameChange}
              />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={fieldLabelStyle}>Вакансия</label>
              <input
                style={inputStyle}
                placeholder="Например, Product Manager"
                value={fbPosition}
                onChange={onFbPositionChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={fieldLabelStyle}>Этап отказа</label>
              <select style={inputStyle} value={fbStage} onChange={onFbStageChange}>
                {STAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={fieldLabelStyle}>Тон фидбека</label>
              <select style={inputStyle} value={fbTone} onChange={onFbToneChange}>
                {TONE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label style={fieldLabelStyle}>Язык</label>
              <select style={inputStyle} value={fbLang} onChange={onFbLangChange}>
                {LANG_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={fieldLabelStyle}>
              Причина отказа (для внутренней логики, в текст не попадает дословно)
            </label>
            <textarea
              style={{ ...inputStyle, fontSize: 13.5, resize: 'vertical' }}
              rows={3}
              placeholder="Например: недостаточно опыта в управлении командой"
              value={fbReason}
              onChange={onFbReasonChange}
            />
          </div>

          <button
            onClick={generateFeedback}
            disabled={cannotGenerate}
            className={cannotGenerate ? '' : 'generate-btn is-enabled'}
            style={{
              width: '100%',
              padding: '13px 16px',
              background: cannotGenerate ? '#C7C9F5' : '#6366F1',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 14.5,
              fontWeight: 700,
              cursor: cannotGenerate ? 'default' : 'pointer',
            }}
          >
            Сгенерировать фидбек
          </button>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 340,
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
          }}
        >
          {feedbackResult ? (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#ECFDF5',
                  color: '#10B981',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
                  marginBottom: 14,
                  width: 'fit-content',
                }}
              >
                ✅ Проверено на юридические риски
              </div>
              {hasRiskFlag && (
                <div style={{ fontSize: 12, color: '#F59E0B', margin: '-8px 0 14px', fontWeight: 600 }}>
                  ⚠ Исключено рискованных упоминаний из причины: {feedbackResult.flaggedCount} — они не попали в текст.
                </div>
              )}

              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: '#1E1E2E',
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: 12,
                  padding: 16,
                  minHeight: 180,
                }}
              >
                {feedbackResult.text}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                <button
                  onClick={copyFeedback}
                  style={{
                    flex: 1,
                    minWidth: 120,
                    padding: '10px 14px',
                    border: '1px solid #E5E7EB',
                    borderRadius: 10,
                    background: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    color: copyColor,
                    cursor: 'pointer',
                  }}
                >
                  {copyLabel}
                </button>
                <button
                  onClick={regenerateFeedback}
                  style={{
                    flex: 1,
                    minWidth: 120,
                    padding: '10px 14px',
                    border: '1px solid #E5E7EB',
                    borderRadius: 10,
                    background: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#374151',
                    cursor: 'pointer',
                  }}
                >
                  Перегенерировать
                </button>
                <button
                  onClick={sendToAts}
                  style={{
                    flex: 1,
                    minWidth: 120,
                    padding: '10px 14px',
                    border: 'none',
                    borderRadius: 10,
                    background: '#EEF0FF',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#4338CA',
                    cursor: 'pointer',
                  }}
                >
                  {atsLabel}
                </button>
              </div>
            </>
          ) : (
            <div
              style={{
                minHeight: 260,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: '#6B7280',
                fontSize: 13.5,
                lineHeight: 1.6,
                padding: 20,
              }}
            >
              Заполните форму слева и нажмите «Сгенерировать фидбек» — здесь появится готовый текст сообщения кандидату.
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <h3
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            margin: '0 0 12px',
          }}
        >
          История последних фидбеков
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
            gap: 12,
          }}
        >
          {history.map((h) => (
            <div
              key={h.id}
              className="history-card"
              style={{
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 2 }}>{h.name}</div>
              <div style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 8 }}>{h.position}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: 11,
                    color: '#6366F1',
                    fontWeight: 600,
                    background: '#EEF0FF',
                    padding: '3px 8px',
                    borderRadius: 20,
                  }}
                >
                  {h.stage}
                </span>
                <span style={{ fontSize: 11.5, color: '#9CA3AF' }}>{h.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
