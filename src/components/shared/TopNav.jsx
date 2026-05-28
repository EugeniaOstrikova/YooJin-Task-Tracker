import { isSupabase } from "../../lib/storage";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import SettingsModal from "./SettingsModal";
import { Settings, LogOut, Squirrel } from "lucide-react";

const LANGS = ["ru", "en", "ko"];

export default function TopNav({
  view,
  onViewChange,
  onImport,
  onExport,
  onSignOut,
}) {
  const [showSettings, setShowSettings] = useState(false);
  const { t, i18n } = useTranslation();

  const tabBtn = (v, label) => (
    <button
      key={v}
      onClick={() => onViewChange(v)}
      className={`tab-btn${view === v ? " is-active" : ""}`}
    >
      {label}
    </button>
  );

  return (
    <div className="top-nav">
      <div className="top-nav__logo-box">
        <Squirrel className="top-nav__logo-item" size={16} />
        <span className="top-nav__logo">{t("nav.title")}</span>
      </div>

      <div className="top-nav__tabs">
        {tabBtn("week", t("nav.week"))}
        {tabBtn("chapter", "Chapters")}
        {tabBtn("stats", t("nav.stats"))}
        {tabBtn("review", t("nav.review"))}
        {tabBtn("goals", t("nav.goals"))}
      </div>

      <div className="top-nav__actions">
        <div className="lang-switcher">
          {LANGS.map((lng) => (
            <button
              key={lng}
              onClick={() => i18n.changeLanguage(lng)}
              className={`lang-btn${i18n.language === lng ? " is-active" : ""}`}
            >
              {lng.toUpperCase()}
            </button>
          ))}
        </div>
        <span
          className={`badge-storage ${isSupabase ? "badge-storage--cloud" : "badge-storage--local"}`}
        >
          {isSupabase ? "☁ Supabase" : "💾 Local"}
        </span>
        <button onClick={onExport} className="btn-export">
          {t("nav.export")}
        </button>
        <button onClick={onImport} className="btn-import">
          {t("nav.import")}
        </button>
        <button onClick={() => setShowSettings(true)} className="btn-export">
          <Settings size={16} className="btn-top-nav" />
        </button>
        <button onClick={onSignOut} className="btn-export">
          <LogOut size={16} className="btn-top-nav" />
        </button>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
