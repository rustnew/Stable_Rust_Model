import * as React from "react";
import { ShieldCheck, Microscope, Zap, GraduationCap, HeartPulse, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-700/20 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs opacity-80">
            <Sparkles className="h-3.5 w-3.5" />
            {t("home.heroBadge")}
          </div>
          <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight">
            {t("home.heroTitleLine1")}
            <span className="block text-emerald-400">{t("home.heroTitleLine2")}</span>
          </h1>
          <p className="mt-4 text-base md:text-lg opacity-80 max-w-3xl mx-auto">
            {t("home.heroDescription")}
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <a href="/demo" className="px-5 py-2.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
              {t("home.ctaDemo")}
            </a>
            <a
              href="#features"
              className="px-5 py-2.5 rounded-md border border-white/20 hover:bg-white/5"
            >
              {t("home.ctaLearnMore")}
            </a>
          </div>
          <p className="mt-3 text-xs opacity-60">
            {t("home.disclaimer")}
          </p>

          {/* Credibility metrics */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="rounded-lg border border-white/10 p-4">
              <div className="text-2xl font-bold">{t("home.metrics.instantTitle")}</div>
              <div className="text-xs opacity-70">{t("home.metrics.instantSub")}</div>
            </div>
            <div className="rounded-lg border border-white/10 p-4">
              <div className="text-2xl font-bold">{t("home.metrics.consistentTitle")}</div>
              <div className="text-xs opacity-70">{t("home.metrics.consistentSub")}</div>
            </div>
            <div className="rounded-lg border border-white/10 p-4">
              <div className="text-2xl font-bold">{t("home.metrics.scalableTitle")}</div>
              <div className="text-xs opacity-70">{t("home.metrics.scalableSub")}</div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Features */}
      <section id="features" className="px-6 sm:px-8 py-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
          <article className="rounded-xl border border-white/10 p-6 bg-white/5">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="h-5 w-5 text-emerald-400" />
              <h3 className="font-semibold">{t("home.features.fasterTriageTitle")}</h3>
            </div>
            <p className="text-sm opacity-80">
              {t("home.features.fasterTriageBody")}
            </p>
          </article>
          <article className="rounded-xl border border-white/10 p-6 bg-white/5">
            <div className="flex items-center gap-3 mb-3">
              <Microscope className="h-5 w-5 text-emerald-400" />
              <h3 className="font-semibold">{t("home.features.labWorkflowTitle")}</h3>
            </div>
            <p className="text-sm opacity-80">
              {t("home.features.labWorkflowBody")}
            </p>
          </article>
          <article className="rounded-xl border border-white/10 p-6 bg-white/5">
            <div className="flex items-center gap-3 mb-3">
              <GraduationCap className="h-5 w-5 text-emerald-400" />
              <h3 className="font-semibold">{t("home.features.educationTitle")}</h3>
            </div>
            <p className="text-sm opacity-80">
              {t("home.features.educationBody")}
            </p>
          </article>
        </div>
      </section>

      {/* Commitment */}
      <section className="px-6 sm:px-8 pb-20">
        <div className="max-w-5xl mx-auto rounded-2xl border border-white/10 p-8 bg-white/5 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs opacity-80 mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t("home.commitment.badge")}
          </div>
          <h3 className="text-2xl md:text-3xl font-bold">{t("home.commitment.title")}</h3>
          <p className="mt-2 text-sm opacity-80 max-w-3xl mx-auto">
            {t("home.commitment.body")}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <a href="mailto:contact@yourdomain.com" className="px-5 py-2.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
              {t("home.commitment.ctaPartner")}
            </a>
            <a href="/demo" className="px-5 py-2.5 rounded-md border border-white/20 hover:bg-white/5">
              {t("home.commitment.ctaExamples")}
            </a>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-xs opacity-70">
            <div className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> {t("home.commitment.bullets.clinical")}</div>
            <div className="flex items-center gap-2"><Microscope className="h-4 w-4" /> {t("home.commitment.bullets.lab")}</div>
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> {t("home.commitment.bullets.onDevice")}</div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="px-6 sm:px-8 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold">{t("home.contact.title")}</h3>
          <p className="mt-2 text-sm opacity-80">{t("home.contact.subtitle")}</p>
          <div className="mt-6">
            <a
              href="mailto:contact@yourdomain.com"
              className="inline-flex px-5 py-2.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {t("home.contact.email")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
