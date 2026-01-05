import * as React from "react";
import { useTranslation } from "react-i18next";

const base = import.meta.env.BASE_URL || "/";
const samples = [
  { url: `${base}infected.jpg`, name: "infected.jpg", labelKey: "labels.infected" },
  { url: `${base}uninfected.jpg`, name: "uninfected.jpg", labelKey: "labels.uninfected" },
];

const Step: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
  <section className="rounded-2xl border border-white/10 p-6 bg-white/5">
    <div className="flex items-center gap-3 mb-2">
      <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-semibold">{number}</div>
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
    <div className="opacity-90 text-sm">{children}</div>
  </section>
);

const DemoPage: React.FC = () => {
  const { t } = useTranslation();
  const [preview, setPreview] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState<number>(0);
  const [running, setRunning] = React.useState<boolean>(false);
  const [result, setResult] = React.useState<null | { parasiteDetected: boolean; confidence: number; processedAt: string }>(null);

  const chooseSample = (url: string) => {
    setPreview(url);
    setResult(null);
    setProgress(0);
    setRunning(false);
  };

  const analyze = async () => {
    if (!preview || running) return;
    setRunning(true);
    setResult(null);
    setProgress(0);

    for (let i = 1; i <= 100; i += Math.max(5, Math.floor(Math.random() * 15))) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 120));
      setProgress(Math.min(100, i));
    }
    // Ensure final progress shows 100%
    setProgress(100);

    // Map known samples deterministically
    let parasiteDetected: boolean;
    let confidence: number;
    const p = preview.toLowerCase();
    if (p.includes("infected.jpg")) {
      parasiteDetected = true;
      confidence = 0.96;
    } else if (p.includes("uninfected.jpg")) {
      parasiteDetected = false;
      confidence = 0.98;
    } else {
      // Fallback heuristic (should not trigger in current flow)
      let hash = 0;
      for (const ch of preview) hash += ch.charCodeAt(0);
      parasiteDetected = hash % 3 !== 0;
      confidence = Math.min(0.99, 0.7 + ((hash % 30) / 100));
    }

    setResult({ parasiteDetected, confidence, processedAt: new Date().toISOString() });
    setRunning(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 py-16 space-y-6">
      <header className="text-center mb-4">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t("demo.title")}</h1>
        <p className="mt-2 text-sm opacity-80">{t("demo.subtitle")}</p>
      </header>

      <Step number={1} title={t("demo.steps.overviewTitle")}> 
        {t("demo.steps.overviewBody")}
      </Step>

      <div className="grid lg:grid-cols-2 gap-6">
        <Step number={2} title={t("demo.steps.selectTitle")}>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {samples.map((s) => (
              <button key={s.url} onClick={() => chooseSample(s.url)} className="group relative rounded-lg overflow-hidden border border-white/10">
                <img src={s.url} alt={t(s.labelKey)} className="h-24 w-full object-cover group-hover:opacity-90" />
                <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 px-1 rounded">{t(s.labelKey)}</span>
              </button>
            ))}
          </div>
          {preview && (
            <img src={preview} alt="preview" className="mt-3 rounded-lg max-h-64 object-contain border border-white/10" />
          )}
        </Step>

        <Step number={3} title={t("demo.steps.analyzeTitle")}>
          <p>{t("demo.selectPrompt")}</p>
          <button
            onClick={analyze}
            disabled={!preview || running}
            className={`mt-4 px-4 py-2 rounded-md text-white ${!preview || running ? "bg-gray-500/60" : "bg-emerald-600 hover:bg-emerald-700"}`}
          >
            {running ? t("demo.analyzing") : t("demo.analyze")}
          </button>
          {(running || progress > 0) && (
            <div className="mt-4">
              <div className="h-2 bg-white/10 rounded">
                <div className="h-2 bg-emerald-500 rounded" style={{ width: `${progress}%`, transition: "width 0.2s" }} />
              </div>
              <div className="text-xs mt-1 opacity-80">{progress}%</div>
            </div>
          )}
          <p className="mt-2 text-xs opacity-60">{t("demo.progressNote")}</p>
        </Step>
      </div>

      <Step number={4} title={t("demo.steps.resultsTitle")}>
        {!result ? (
          <p className="text-sm opacity-80">{t("demo.noResult")}</p>
        ) : (
          <div className="space-y-2">
            <div>
              {t("demo.parasiteDetected")} {result.parasiteDetected ? (
                <span className="text-red-400 font-semibold">{t("labels.yes")}</span>
              ) : (
                <span className="text-emerald-400 font-semibold">{t("labels.no")}</span>
              )}
            </div>
            <div>{t("demo.confidence")} {(result.confidence * 100).toFixed(1)}%</div>
            <div className="text-xs opacity-60">{t("demo.processedAt")} {result.processedAt}</div>
          </div>
        )}
      </Step>
    </div>
  );
};

export default DemoPage;
