import React from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANG_STORAGE_KEY, SUPPORTED_LANGUAGES, type Language } from "@/i18n";
import { cn } from "@/lib/utils";

const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  zh: "中文",
};

const LanguageSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { i18n } = useTranslation();
  const current = (i18n.language || "en").split("-")[0] as Language;

  // Most strings are translated at their call site with the i18n singleton,
  // so a reload guarantees every surface picks up the new language.
  const select = (language: Language) => {
    window.localStorage.setItem(LANG_STORAGE_KEY, language);
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={i18n.t("Change language")}
          title={i18n.t("Change language")}
          className={cn(
            "flex items-center gap-1.5 rounded-md border border-gray-700 px-2 py-1.5",
            "text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white",
            className
          )}
        >
          <Globe className="h-4 w-4" />
          <span>{LANGUAGE_LABELS[current] ?? current}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700 text-gray-200">
        {SUPPORTED_LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language}
            onClick={() => select(language)}
            className={cn(
              "cursor-pointer focus:bg-gray-800",
              language === current && "bg-gray-800/60 text-white"
            )}
          >
            {LANGUAGE_LABELS[language]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
