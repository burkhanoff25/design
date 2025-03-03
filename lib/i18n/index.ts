"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { translations } from "./translations";

type Language = "uz" | "ru" | "en";
type TranslationKey = keyof typeof translations.uz;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};

export const useTranslation = () => {
  const { t } = useI18n();
  return { t };
};

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("uz");

  useEffect(() => {
    // Get language from localStorage or detect browser language
    const storedLanguage = localStorage.getItem("language") as Language;
    if (storedLanguage && ["uz", "ru", "en"].includes(storedLanguage)) {
      setLanguageState(storedLanguage);
    } else {
      const browserLang = navigator.language.split("-")[0];
      if (browserLang === "ru") {
        setLanguageState("ru");
      } else if (browserLang === "en") {
        setLanguageState("en");
      }
      // Default is already 'uz'
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return React.createElement(
    I18nContext.Provider,
    {
      value: { language, setLanguage, t },
    },
    children
  );
};
