
import React, { createContext, useState, useContext, useEffect } from "react";

type Language = 
  | "English"
  | "Hindi"
  | "Punjabi"
  | "Haryanvi"
  | "Bhojpuri"
  | "Telugu"
  | "Tamil" 
  | "Gujarati"
  | "Urdu";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translate: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage");
    return (savedLanguage as Language) || "English";
  });
  
  // Load translations
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});
  
  useEffect(() => {
    // Load all translation files
    const loadTranslations = async () => {
      try {
        const allTranslations: Record<string, Record<string, string>> = {};
        
        // Import translations for each language
        const englishModule = await import("../data/translations/english.ts");
        const hindiModule = await import("../data/translations/hindi.ts");
        const punjabModule = await import("../data/translations/punjabi.ts");
        const haryanviModule = await import("../data/translations/haryanvi.ts");
        const bhojpuriModule = await import("../data/translations/bhojpuri.ts");
        const teluguModule = await import("../data/translations/telugu.ts");
        const tamilModule = await import("../data/translations/tamil.ts");
        const gujaratiModule = await import("../data/translations/gujarati.ts");
        const urduModule = await import("../data/translations/urdu.ts");
        
        allTranslations["English"] = englishModule.default;
        allTranslations["Hindi"] = hindiModule.default;
        allTranslations["Punjabi"] = punjabModule.default;
        allTranslations["Haryanvi"] = haryanviModule.default;
        allTranslations["Bhojpuri"] = bhojpuriModule.default;
        allTranslations["Telugu"] = teluguModule.default;
        allTranslations["Tamil"] = tamilModule.default;
        allTranslations["Gujarati"] = gujaratiModule.default;
        allTranslations["Urdu"] = urduModule.default;
        
        setTranslations(allTranslations);
      } catch (error) {
        console.error("Failed to load translations:", error);
      }
    };
    
    loadTranslations();
  }, []);
  
  useEffect(() => {
    localStorage.setItem("preferredLanguage", language);
  }, [language]);
  
  const translate = (key: string): string => {
    if (!translations[language]) {
      return key; // Fallback if translations not loaded yet
    }
    
    return translations[language][key] || translations["English"][key] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};
