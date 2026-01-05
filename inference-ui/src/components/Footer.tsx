import * as React from "react";
import { useTranslation } from "react-i18next";

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-white/10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
        <div className="opacity-80">
          <div className="font-semibold">{t("app.title")}</div>
          <div className="text-xs">{t("footer.tagline")}</div>
        </div>
        <div className="flex gap-6 opacity-80">
          <a href="#privacy" className="hover:underline">{t("footer.privacy")}</a>
          <a href="#terms" className="hover:underline">{t("footer.terms")}</a>
          <a href="mailto:contact@yourdomain.com" className="hover:underline">{t("footer.contact")}</a>
        </div>
        <div className="text-xs opacity-60">© {new Date().getFullYear()} {t("footer.rights")}</div>
      </div>
    </footer>
  );
};
