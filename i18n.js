import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./locales/en/translation.json";
import es from "./locales/es/translation.json";

const LANG_STORAGE_KEY = "appLanguage";

const initI18n = async () => {
  const savedLang = await AsyncStorage.getItem(LANG_STORAGE_KEY);
  const defaultLang = savedLang || "en";

  await i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: "v3",
      lng: defaultLang,
      fallbackLng: "en",
      resources: {
        en: { translation: en },
        es: { translation: es },
      },
      interpolation: {
        escapeValue: false,
      },
    });
};

initI18n(); // Call this at the bottom

export default i18n;
