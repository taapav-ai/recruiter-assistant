import React, { useState } from "react";
import { Plus, X, Copy, Check, Loader2, AlertCircle, RotateCcw } from "lucide-react";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap";

const RATING_META = {
  below: { label: "ниже планки", color: "#B54B3A", pos: 18 },
  at: { label: "на уровне", color: "#8A8578", pos: 50 },
  above: { label: "выше планки", color: "#C9973F", pos: 82 },
};

const QUICK_COMPETENCIES = [
  "Технические навыки", "Опыт в индустрии", "Структура мышления",
  "Коммуникация в кейсе", "Стратегическое видение", "Управление проектами",
  "Знание инструментов", "Уровень английского", "Глубина экспертизы",
];

const BLOCKLIST = [
  "возраст", "лет ей", "лет ему", "беременн", "замужем", "женат", "разведен",
  "национальност", "вероисповедан", "религи", "инвалид", "здоровь",
  "pregnant", "married", "divorced", "age of", "disability", "nationality",
  "religion", "race", "ethnic",
];

function sanitizeContext(text) {
  let clean = text;
  let hit = false;
  BLOCKLIST.forEach((word) => {
    const re = new RegExp(word, "gi");
    if (re.test(clean)) {
      hit = true;
      clean = clean.replace(re, "[удалено]");
    }
  });
  return { clean, hit };
}

let idCounter = 0;
const nextId = () => `c${idCounter++}`;

export default function FeedbackGenerator() {
  const [roleName, setRoleName] = useState("");
  const [level, setLevel] = useState("Middle");
  const [stage, setStage] = useState("Финальное интервью");
  const [language, setLanguage] = useState("ru");
  const [competencies, setCompetencies] = useState([]);
  const [newCompName, setNewCompName] = useState("");
  const [context, setContext] = useState("");
  const [contextWarning, setContextWarning] = useState(false);
  const [variants, setVariants] = useState(null);
  const [activeTab, setActiveTab] = useState("soft");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  const addCompetency = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (competencies.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) return;
    setCompetencies([...competencies, { id: nextId(), name: trimmed, rating: "at" }]);
    setNewCompName("");
  };

  const removeCompetency = (id) => setCompetencies(competencies.filter((c) => c.id !== id));

  const setRating = (id, rating) =>
    setCompetencies(competencies.map((c) => (c.id === id ? { ...c, rating } : c)));

  const handleContextChange = (val) => {
    const { clean, hit } = sanitizeContext(val);
    setContext(clean);
    setContextWarning(hit);
  };

  const canGenerate = roleName.trim().length > 0 && competencies.length > 0 && !loading;

  const generate = async () => {
    setLoading(true);
    setError(null);
    setVariants(null);

    const langLabel = { ru: "русском", en: "английском", ua: "украинском" }[language];

    const systemPrompt = `Ты помогаешь рекрутерам писать конструктивный, юридически безопасный фидбек кандидатам после отказа.

СТРОГИЕ ПРАВИЛА:
1. Разрешено упоминать ТОЛЬКО: конкретные хард-скиллы, уровень опыта относительно требований роли, компетенции из предоставленного списка, структуру подхода к задачам/кейсам.
2. ЗАПРЕЩЕНО упоминать в любой форме: возраст, пол, семейное положение, национальность, религию, здоровье, внешность, "вайб"/личные впечатления, сравнение с конкретными другими кандидатами, внутреннюю информацию о бюджете или реорганизациях.
3. Если в поле "дополнительный контекст" встречается что-либо из запрещённого списка или иная защищённая характеристика — полностью игнорируй это, не используй в тексте.
4. Тон уважительный, профессиональный, без клише "мы решили двигаться с другим кандидатом" без объяснений.
5. Пиши на ${langLabel} языке.

Ответь СТРОГО в формате JSON без markdown-разметки, без обратных кавычек, без преамбулы:
{"soft": "...", "direct": "...", "detailed": "..."}

- soft: 2-3 предложения, мягкий и общий тон, подходит для ранних этапов отбора.
- direct: один абзац, называет конкретные компетенции с gap, профессиональный нейтральный тон.
- detailed: структурированный фидбек (сильные стороны + зоны роста + рекомендация), подходит для кандидатов, дошедших до финальных этапов.`;

    const compSummary = competencies
      .map((c) => `${c.name}: ${RATING_META[c.rating].label}`)
      .join("; ");

    const userPrompt = `Роль: ${roleName}
Уровень: ${level}
Этап отказа: ${stage}
Оценка по компетенциям: ${compSummary}
Дополнительный контекст (использовать с осторожностью, игнорировать защищённые характеристики): ${context || "нет"}`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!response.ok) throw new Error("Ошибка запроса к API");
      const data = await response.json();
      const textBlock = data.content.find((b) => b.type === "text");
      if (!textBlock) throw new Error("Пустой ответ");

      const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setVariants(parsed);
      setActiveTab("soft");
    } catch (e) {
      setError("Не удалось сгенерировать фидбек. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (key) => {
    if (!variants || !variants[key]) return;
    navigator.clipboard.writeText(variants[key]);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('${FONT_LINK}');
        * { box-sizing: border-box; }
        input, select, textarea, button { font-family: 'IBM Plex Sans', sans-serif; }
        ::selection { background: #2F5D5033; }
      `}</style>

      <header style={styles.header}>
        <div style={styles.headerInner}>
          <span style={styles.eyebrow}>ИНСТРУМЕНТ ДЛЯ РЕКРУТЕРОВ</span>
          <h1 style={styles.title}>Обратная связь вместо тишины</h1>
          <p style={styles.subtitle}>
            Структурированная оценка кандидата → конструктивный, юридически безопасный фидбек.
            Без «мы выбрали другого кандидата» без объяснений.
          </p>
        </div>
      </header>

      <main style={styles.main}>
        {/* LEFT: FORM */}
        <section style={styles.panel}>
          <div style={styles.fieldRow}>
            <div style={{ flex: 2 }}>
              <label style={styles.label}>Позиция</label>
              <input
                style={styles.input}
                placeholder="Например, SMM Lead"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Уровень</label>
              <select style={styles.input} value={level} onChange={(e) => setLevel(e.target.value)}>
                {["Junior", "Middle", "Senior", "Lead"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.fieldRow}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Этап отказа</label>
              <select style={styles.input} value={stage} onChange={(e) => setStage(e.target.value)}>
                {["Скрининг резюме", "Первое интервью", "Техническое интервью", "Финальное интервью", "Оффер-стадия"].map(
                  (s) => (
                    <option key={s}>{s}</option>
                  )
                )}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Язык фидбека</label>
              <select style={styles.input} value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="ru">Русский</option>
                <option value="en">English</option>
                <option value="ua">Українська</option>
              </select>
            </div>
          </div>

          <div style={styles.divider} />

          <label style={styles.label}>Компетенции и оценка относительно планки роли</label>
          <p style={styles.hint}>Планка — это требования роли. Отметьте, где кандидат оказался.</p>

          <div style={styles.quickChips}>
            {QUICK_COMPETENCIES.filter(
              (q) => !competencies.some((c) => c.name === q)
            ).map((q) => (
              <button key={q} style={styles.chip} onClick={() => addCompetency(q)}>
                <Plus size={12} strokeWidth={2.5} /> {q}
              </button>
            ))}
          </div>

          <div style={styles.customAddRow}>
            <input
              style={{ ...styles.input, flex: 1 }}
              placeholder="Своя компетенция…"
              value={newCompName}
              onChange={(e) => setNewCompName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCompetency(newCompName)}
            />
            <button style={styles.addBtn} onClick={() => addCompetency(newCompName)}>
              <Plus size={16} />
            </button>
          </div>

          <div style={styles.compList}>
            {competencies.length === 0 && (
              <p style={styles.emptyState}>Добавьте хотя бы одну компетенцию из списка выше или свою.</p>
            )}
            {competencies.map((c) => (
              <div key={c.id} style={styles.compRow}>
                <div style={styles.compTop}>
                  <span style={styles.compName}>{c.name}</span>
                  <button style={styles.removeBtn} onClick={() => removeCompetency(c.id)}>
                    <X size={13} />
                  </button>
                </div>
                <BarSlider rating={c.rating} onChange={(r) => setRating(c.id, r)} />
              </div>
            ))}
          </div>

          <div style={styles.divider} />

          <label style={styles.label}>Дополнительный контекст (только для генерации, не попадёт в текст кандидату дословно)</label>
          <textarea
            style={styles.textarea}
            rows={3}
            placeholder="Например: выбрали кандидата с более релевантным отраслевым опытом"
            value={context}
            onChange={(e) => handleContextChange(e.target.value)}
          />
          {contextWarning && (
            <p style={styles.warning}>
              <AlertCircle size={13} /> Часть текста автоматически скрыта — похоже на защищённую характеристику.
            </p>
          )}

          <button style={{ ...styles.generateBtn, opacity: canGenerate ? 1 : 0.45 }} onClick={generate} disabled={!canGenerate}>
            {loading ? (
              <>
                <Loader2 size={16} className="spin" style={{ animation: "spin 0.8s linear infinite" }} /> Генерирую…
              </>
            ) : (
              "Сгенерировать фидбек"
            )}
          </button>
          <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
          {error && <p style={styles.warning}><AlertCircle size={13} /> {error}</p>}
        </section>

        {/* RIGHT: RESULTS */}
        <section style={styles.panel}>
          <label style={styles.label}>Результат</label>
          {!variants && !loading && (
            <div style={styles.placeholder}>
              <p style={styles.placeholderText}>
                Заполните форму слева — здесь появятся три варианта формулировки: мягкий, прямой и детальный.
              </p>
            </div>
          )}
          {loading && (
            <div style={styles.placeholder}>
              <Loader2 size={20} style={{ animation: "spin 0.8s linear infinite" }} />
            </div>
          )}
          {variants && (
            <>
              <div style={styles.tabs}>
                {[
                  { key: "soft", label: "Мягкий" },
                  { key: "direct", label: "Прямой" },
                  { key: "detailed", label: "Детальный" },
                ].map((t) => (
                  <button
                    key={t.key}
                    style={{
                      ...styles.tab,
                      ...(activeTab === t.key ? styles.tabActive : {}),
                    }}
                    onClick={() => setActiveTab(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div style={styles.resultBox}>
                <textarea
                  style={styles.resultText}
                  value={variants[activeTab]}
                  onChange={(e) => setVariants({ ...variants, [activeTab]: e.target.value })}
                />
                <button style={styles.copyBtn} onClick={() => copyToClipboard(activeTab)}>
                  {copied === activeTab ? <Check size={14} /> : <Copy size={14} />}
                  {copied === activeTab ? "Скопировано" : "Копировать"}
                </button>
              </div>
              <button style={styles.regenBtn} onClick={generate}>
                <RotateCcw size={13} /> Сгенерировать заново
              </button>
            </>
          )}
        </section>
      </main>

      <footer style={styles.footer}>
        Фидбек не должен содержать оценки личности, возраста, здоровья или сравнения с другими кандидатами —
        только компетенции и требования роли.
      </footer>
    </div>
  );
}

function BarSlider({ rating, onChange }) {
  const options = ["below", "at", "above"];
  const meta = RATING_META[rating];
  return (
    <div style={sliderStyles.wrap}>
      <div style={sliderStyles.track}>
        <div style={sliderStyles.barLine} />
        <div style={{ ...sliderStyles.marker, left: `${meta.pos}%`, background: meta.color }} />
      </div>
      <div style={sliderStyles.buttons}>
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            style={{
              ...sliderStyles.optBtn,
              color: rating === o ? RATING_META[o].color : "#9C978A",
              fontWeight: rating === o ? 600 : 400,
            }}
          >
            {RATING_META[o].label}
          </button>
        ))}
      </div>
    </div>
  );
}

const sliderStyles = {
  wrap: { marginTop: 6, marginBottom: 4 },
  track: { position: "relative", height: 6, background: "#EAE7DF", borderRadius: 3, marginBottom: 6 },
  barLine: {
    position: "absolute", left: 0, right: 0, top: "50%", height: 1,
    background: "repeating-linear-gradient(90deg, #C4C0B4 0 4px, transparent 4px 8px)",
  },
  marker: {
    position: "absolute", top: "50%", width: 12, height: 12, borderRadius: "50%",
    transform: "translate(-50%, -50%)", border: "2px solid #fff", boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
  },
  buttons: { display: "flex", justifyContent: "space-between" },
  optBtn: {
    background: "none", border: "none", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11, padding: "2px 4px", letterSpacing: "0.02em",
  },
};

const styles = {
  page: {
    minHeight: "100vh", background: "#F5F6F2", color: "#1B1F23",
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  header: {
    borderBottom: "1px solid #E4E2DC", background: "#FFFFFF",
    padding: "32px 24px 28px",
  },
  headerInner: { maxWidth: 920, margin: "0 auto" },
  eyebrow: {
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.12em",
    color: "#2F5D50", fontWeight: 500,
  },
  title: {
    fontFamily: "'Source Serif 4', serif", fontSize: 30, fontWeight: 600,
    margin: "6px 0 8px", color: "#161A1E",
  },
  subtitle: { fontSize: 14.5, color: "#5C594F", maxWidth: 560, lineHeight: 1.5, margin: 0 },
  main: {
    maxWidth: 920, margin: "0 auto", padding: "28px 24px 40px",
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20,
  },
  panel: {
    background: "#FFFFFF", border: "1px solid #E4E2DC", borderRadius: 10,
    padding: 22, alignSelf: "start",
  },
  fieldRow: { display: "flex", gap: 12, marginBottom: 14 },
  label: {
    display: "block", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
    letterSpacing: "0.06em", color: "#5C594F", marginBottom: 6, textTransform: "uppercase",
  },
  hint: { fontSize: 12.5, color: "#8A8578", margin: "-2px 0 12px" },
  input: {
    width: "100%", padding: "9px 11px", border: "1px solid #DDDACF", borderRadius: 6,
    fontSize: 14, background: "#FCFBF8", color: "#1B1F23", outline: "none",
  },
  textarea: {
    width: "100%", padding: "9px 11px", border: "1px solid #DDDACF", borderRadius: 6,
    fontSize: 13.5, background: "#FCFBF8", color: "#1B1F23", outline: "none", resize: "vertical",
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  divider: { height: 1, background: "#EDEBE3", margin: "18px 0" },
  quickChips: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  chip: {
    display: "flex", alignItems: "center", gap: 4, fontSize: 12, padding: "5px 9px",
    borderRadius: 20, border: "1px solid #DDDACF", background: "#FCFBF8", color: "#4A473E",
    cursor: "pointer",
  },
  customAddRow: { display: "flex", gap: 8, marginBottom: 14 },
  addBtn: {
    background: "#2F5D50", border: "none", color: "#fff", borderRadius: 6,
    width: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  },
  compList: { display: "flex", flexDirection: "column", gap: 12 },
  emptyState: { fontSize: 13, color: "#9C978A", fontStyle: "italic" },
  compRow: { padding: "8px 0" },
  compTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 },
  compName: { fontSize: 13.5, fontWeight: 500 },
  removeBtn: { background: "none", border: "none", cursor: "pointer", color: "#B0ABA0", padding: 2 },
  warning: {
    display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#B54B3A", marginTop: 8,
  },
  generateBtn: {
    width: "100%", marginTop: 20, padding: "12px", background: "#2F5D50", color: "#fff",
    border: "none", borderRadius: 7, fontSize: 14.5, fontWeight: 500, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  },
  placeholder: {
    minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center",
    color: "#9C978A",
  },
  placeholderText: { fontSize: 13.5, textAlign: "center", maxWidth: 280, lineHeight: 1.6 },
  tabs: { display: "flex", gap: 4, marginBottom: 12, borderBottom: "1px solid #EDEBE3" },
  tab: {
    background: "none", border: "none", padding: "8px 12px", fontSize: 13, cursor: "pointer",
    color: "#8A8578", borderBottom: "2px solid transparent", marginBottom: -1,
  },
  tabActive: { color: "#2F5D50", borderBottom: "2px solid #2F5D50", fontWeight: 600 },
  resultBox: { position: "relative" },
  resultText: {
    width: "100%", minHeight: 200, padding: 14, border: "1px solid #E4E2DC", borderRadius: 8,
    background: "#FCFBF8", fontSize: 14, lineHeight: 1.6, color: "#1B1F23", resize: "vertical",
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  copyBtn: {
    marginTop: 10, display: "flex", alignItems: "center", gap: 6, padding: "7px 12px",
    border: "1px solid #DDDACF", borderRadius: 6, background: "#fff", fontSize: 12.5,
    cursor: "pointer", color: "#4A473E",
  },
  regenBtn: {
    marginTop: 10, display: "flex", alignItems: "center", gap: 6, background: "none",
    border: "none", color: "#8A8578", fontSize: 12.5, cursor: "pointer", padding: 4,
  },
  footer: {
    textAlign: "center", fontSize: 12, color: "#9C978A", padding: "20px 24px 32px", maxWidth: 600,
    margin: "0 auto", lineHeight: 1.5,
  },
};
