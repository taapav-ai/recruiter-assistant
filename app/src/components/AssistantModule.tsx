import { useRef } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { VACANCIES } from '../data/constants';
import { buildQuestions, initials, scoreColor } from '../data/helpers';
import type { Candidate } from '../types';

interface AssistantModuleProps {
  candidates: Candidate[];
  selectedCandidateId: string;
  selectedVacancy: string;
  onVacancyChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  selectCandidate: (id: string) => void;
  isDragging: boolean;
  onDropzoneDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDropzoneDragLeave: () => void;
  onDropzoneDrop: (e: DragEvent<HTMLDivElement>) => void;
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  uploadError: string | null;
}

export default function AssistantModule({
  candidates, selectedCandidateId, selectedVacancy, onVacancyChange, selectCandidate,
  isDragging, onDropzoneDragOver, onDropzoneDragLeave, onDropzoneDrop,
  onFileSelected, isUploading, uploadError,
}: AssistantModuleProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    onDropzoneDrop(e);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
    e.target.value = '';
  };
  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId) || null;

  const dropzoneBorder = isDragging ? '#6366F1' : '#D1D5DB';
  const dropzoneBg = isDragging ? '#EEF0FF' : '#FAFAFB';

  const matchScore = selectedCandidate ? selectedCandidate.scores[selectedVacancy] ?? 0 : 0;
  const matchColor = scoreColor(matchScore);

  return (
    <div style={{ maxWidth: 1200, display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 220 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            padding: '0 4px 4px',
          }}
        >
          Кандидаты ({candidates.length})
        </div>
        {candidates.map((c) => {
          const score = c.scores[selectedVacancy] ?? 0;
          const isSelected = c.id === selectedCandidateId;
          return (
            <button
              key={c.id}
              onClick={() => selectCandidate(c.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: 10,
                borderRadius: 12,
                border: `1px solid ${isSelected ? '#6366F1' : '#E5E7EB'}`,
                background: isSelected ? '#EEF0FF' : '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#E0E1FA',
                  color: '#4338CA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {initials(c.name)}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.name}
                </div>
                <div style={{ fontSize: 11.5, color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.position}
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: scoreColor(score), flexShrink: 0 }}>
                {score}%
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, minWidth: 420, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            Recruiter Assistant
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
            Досье кандидата, оценка соответствия вакансии и вопросы для интервью.
          </p>
        </div>

        <div
          onDragOver={onDropzoneDragOver}
          onDragLeave={onDropzoneDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dropzoneBorder}`,
            borderRadius: 16,
            padding: 26,
            textAlign: 'center',
            cursor: isUploading ? 'default' : 'pointer',
            background: dropzoneBg,
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#EEF0FF',
              color: '#6366F1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 800,
              margin: '0 auto 10px',
            }}
          >
            +
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1E1E2E', marginBottom: 4 }}>
            {isUploading ? 'Анализируем резюме…' : 'Перетащите PDF-резюме сюда'}
          </div>
          <div style={{ fontSize: 12.5, color: '#6B7280' }}>
            {isUploading ? 'Это может занять несколько секунд' : 'или нажмите, чтобы выбрать PDF-файл'}
          </div>
          {uploadError && (
            <div style={{ fontSize: 12.5, color: '#F59E0B', marginTop: 10, fontWeight: 600 }}>{uploadError}</div>
          )}
        </div>

        <div
          style={{
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: 16,
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Оцениваем на позицию
          </label>
          <select
            style={{
              padding: '9px 12px',
              border: '1px solid #E5E7EB',
              borderRadius: 10,
              fontSize: 13.5,
              color: '#1E1E2E',
              background: '#F9FAFB',
              outline: 'none',
            }}
            value={selectedVacancy}
            onChange={onVacancyChange}
          >
            {VACANCIES.map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
        </div>

        {selectedCandidate && (
          <>
            <div
              style={{
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: 16,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{selectedCandidate.name}</div>
                  <div style={{ fontSize: 13.5, color: '#6B7280', marginTop: 2 }}>
                    {selectedCandidate.position} · {selectedCandidate.experience} лет опыта
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: matchColor }}>{matchScore}%</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>соответствие вакансии</div>
                </div>
              </div>

              <div style={{ height: 8, background: '#F3F4F6', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 6, width: `${matchScore}%`, background: matchColor }} />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selectedCandidate.skills.map((sk) => (
                  <span
                    key={sk}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#4338CA',
                      background: '#EEF0FF',
                      padding: '5px 10px',
                      borderRadius: 20,
                    }}
                  >
                    {sk}
                  </span>
                ))}
              </div>

              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#374151', margin: 0 }}>{selectedCandidate.summary}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                    Плюсы
                  </div>
                  {selectedCandidate.pros.map((p, i) => (
                    <div key={i} style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 6, paddingLeft: 14, position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, color: '#10B981' }}>•</span>
                      {p}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                    Зоны риска
                  </div>
                  {selectedCandidate.risks.map((r, i) => (
                    <div key={i} style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 6, paddingLeft: 14, position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, color: '#F59E0B' }}>•</span>
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: 16,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Вопросы для интервью
              </div>
              {(selectedCandidate.interviewQuestions ?? buildQuestions(selectedCandidate)).map((q, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: '#EEF0FF',
                      color: '#6366F1',
                      fontSize: 11.5,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ fontSize: 13.5, color: '#1E1E2E', lineHeight: 1.55 }}>{q}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
