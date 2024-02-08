import locale from "i18next";
import { initReactI18next} from "react-i18next";
import Backend from "i18next-xhr-backend";
import LanguageDetector from "i18next-browser-languagedetector";

const Languages = ['en', 'fr'];

export default locale
    // load translation using xhr -> see /public/locales
    .use(Backend)
    // detect user language
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        debug: true,
        whitelist: Languages,
        backend: {
            loadPath: `${process.env.PUBLIC_URL}/locales/{{lng}}/{{ns}}.json`
        },
        interpolation: {
            escapeValue: false,
        },
    });

// window.location.pathname


