import { useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import Sidebar from './components/Sidebar';
import FeedbackModule from './components/FeedbackModule';
import AssistantModule from './components/AssistantModule';
import { CANDIDATES_SEED, STAGE_OPTIONS } from './data/constants';
import { buildFeedbackText, countRiskyMentions } from './data/feedbackText';
import { formatDate } from './data/helpers';
import type { Candidate, FeedbackResult, HistoryItem, Lang, Module, Stage, Tone } from './types';

const INITIAL_HISTORY: HistoryItem[] = [
  { id: 'h1', name: 'Мария Иванова', position: 'Marketing Manager', stage: 'Финал', date: '05 июл' },
  { id: 'h2', name: 'Сергей Волков', position: 'Backend разработчик', stage: 'Интервью', date: '03 июл' },
  { id: 'h3', name: 'Ольга Крылова', position: 'HR BP', stage: 'Тестовое задание', date: '01 июл' },
  { id: 'h4', name: 'Артём Быков', position: 'QA инженер', stage: 'Скрининг', date: '28 июн' },
  { id: 'h5', name: 'Наталья Гринько', position: 'Designer', stage: 'Резюме', date: '25 июн' },
];

function App() {
  const [module, setModule] = useState<Module>('feedback');

  // Feedback module state
  const [fbName, setFbName] = useState('');
  const [fbPosition, setFbPosition] = useState('');
  const [fbStage, setFbStage] = useState<Stage>('final');
  const [fbReason, setFbReason] = useState('');
  const [fbTone, setFbTone] = useState<Tone>('neutral');
  const [fbLang, setFbLang] = useState<Lang>('ru');
  const [fbVariant, setFbVariant] = useState(0);
  const [feedbackResult, setFeedbackResult] = useState<FeedbackResult | null>({
    text: buildFeedbackText('Мария Иванова', 'Marketing Manager', 'final', 'neutral', 'ru', 0),
    flaggedCount: 0,
  });
  const [copyState, setCopyState] = useState<'copied' | null>(null);
  const [atsState, setAtsState] = useState<'sent' | null>(null);
  const [fbHistory, setFbHistory] = useState<HistoryItem[]>(INITIAL_HISTORY);

  // Assistant module state
  const [candidates, setCandidates] = useState<Candidate[]>(() => CANDIDATES_SEED.map((c) => ({ ...c })));
  const [selectedCandidateId, setSelectedCandidateId] = useState('cand1');
  const [selectedVacancy, setSelectedVacancy] = useState('frontend');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const canGenerate = fbName.trim().length > 0 && fbPosition.trim().length > 0;

  const generateFeedback = () => {
    const name = fbName.trim() || 'Кандидат';
    const position = fbPosition.trim() || 'выбранную позицию';
    const text = buildFeedbackText(name, position, fbStage, fbTone, fbLang, 0);
    const flaggedCount = countRiskyMentions(fbReason);
    const stageLabelShort = STAGE_OPTIONS.find((s) => s.value === fbStage)?.label ?? '';
    const newHistoryItem: HistoryItem = {
      id: 'h' + Date.now(),
      name,
      position: fbPosition.trim() || position,
      stage: stageLabelShort,
      date: formatDate(new Date()),
    };

    setFeedbackResult({ text, flaggedCount });
    setFbVariant(0);
    setCopyState(null);
    setAtsState(null);
    setFbHistory((prev) => [newHistoryItem, ...prev].slice(0, 5));
  };

  const regenerateFeedback = () => {
    const name = fbName.trim() || 'Кандидат';
    const position = fbPosition.trim() || 'выбранную позицию';
    const nextVariant = fbVariant + 1;
    const text = buildFeedbackText(name, position, fbStage, fbTone, fbLang, nextVariant);

    setFeedbackResult({ text, flaggedCount: countRiskyMentions(fbReason) });
    setFbVariant(nextVariant);
    setCopyState(null);
    setAtsState(null);
  };

  const copyFeedback = () => {
    if (!feedbackResult) return;
    navigator.clipboard.writeText(feedbackResult.text);
    setCopyState('copied');
    setTimeout(() => setCopyState(null), 1600);
  };

  const sendToAts = () => {
    setAtsState('sent');
    setTimeout(() => setAtsState(null), 1800);
  };

  const onDropzoneDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDropzoneDragLeave = () => setIsDragging(false);
  const onDropzoneDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onFileSelected = async (file: File) => {
    setUploadError(null);

    if (file.type !== 'application/pdf') {
      setUploadError('Поддерживаются только PDF-файлы.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('/api/analyze-resume', { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok) {
        setUploadError(data.error ?? 'Не удалось проанализировать резюме.');
        return;
      }

      const id = 'upload-' + Date.now();
      const newCandidate: Candidate = { ...data, id };
      setCandidates((prev) => [...prev, newCandidate]);
      setSelectedCandidateId(id);
    } catch {
      setUploadError('Не удалось связаться с сервером анализа резюме.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: '#F8F9FC',
        color: '#1E1E2E',
      }}
    >
      <Sidebar module={module} setModule={setModule} />

      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 40px 60px' }}>
        {module === 'feedback' && (
          <FeedbackModule
            fbName={fbName}
            fbPosition={fbPosition}
            fbStage={fbStage}
            fbReason={fbReason}
            fbTone={fbTone}
            fbLang={fbLang}
            onFbNameChange={(e: ChangeEvent<HTMLInputElement>) => setFbName(e.target.value)}
            onFbPositionChange={(e: ChangeEvent<HTMLInputElement>) => setFbPosition(e.target.value)}
            onFbStageChange={(e: ChangeEvent<HTMLSelectElement>) => setFbStage(e.target.value as Stage)}
            onFbReasonChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFbReason(e.target.value)}
            onFbToneChange={(e: ChangeEvent<HTMLSelectElement>) => setFbTone(e.target.value as Tone)}
            onFbLangChange={(e: ChangeEvent<HTMLSelectElement>) => setFbLang(e.target.value as Lang)}
            cannotGenerate={!canGenerate}
            generateFeedback={generateFeedback}
            feedbackResult={feedbackResult}
            copyState={copyState}
            atsState={atsState}
            copyFeedback={copyFeedback}
            regenerateFeedback={regenerateFeedback}
            sendToAts={sendToAts}
            history={fbHistory}
          />
        )}

        {module === 'assistant' && (
          <AssistantModule
            candidates={candidates}
            selectedCandidateId={selectedCandidateId}
            selectedVacancy={selectedVacancy}
            onVacancyChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedVacancy(e.target.value)}
            selectCandidate={setSelectedCandidateId}
            isDragging={isDragging}
            onDropzoneDragOver={onDropzoneDragOver}
            onDropzoneDragLeave={onDropzoneDragLeave}
            onDropzoneDrop={onDropzoneDrop}
            onFileSelected={onFileSelected}
            isUploading={isUploading}
            uploadError={uploadError}
          />
        )}
      </main>
    </div>
  );
}

export default App;
