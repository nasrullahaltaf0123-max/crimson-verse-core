import { useI18n } from "@/contexts/I18nContext";

const LangToggle = () => {
  const { lang, setLang } = useI18n();

  return (
    <button
      onClick={() => setLang(lang === "en" ? "bn" : "en")}
      className="px-2.5 py-1.5 rounded-lg bg-muted hover:bg-surface-high transition-colors active:scale-95 font-body text-xs font-bold text-foreground"
      aria-label="Toggle language"
    >
      {lang === "en" ? "বাং" : "EN"}
    </button>
  );
};

export default LangToggle;
