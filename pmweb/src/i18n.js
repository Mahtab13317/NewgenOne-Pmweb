import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import secureLocalStorage from "react-secure-storage";

// const Languages = ["en", "ar"];

i18n
  // load translation using xhr -> see /public/locales
  .use(Backend)
  // detect user language
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    defaultNS: "translation",
    ns: ["translation"],
    lng:
      //code added for 137913,136352
      secureLocalStorage.getItem("locale") ||
      //till here
      navigator.language ||
      navigator.userLanguage,

    fallbackLng: "en",
    debug: true,
    // whitelist: Languages,
    backend: {
      // loadPath: "/processDesigner/locales/ar/translation.json",
      loadPath: "/processDesigner/locales/{{lng}}/{{ns}}.json",
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // <---- this will do the magic
    },
  });

export default i18n;
