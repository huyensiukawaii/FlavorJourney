import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import viHomepage from "./locales/vi/homepage.json";
import jpHomepage from "./locales/jp/homepage.json";
import viSidebar from "./locales/vi/sidebar.json";
import jpSidebar from "./locales/jp/sidebar.json";
import viAdmin from "./locales/vi/admin.json";
import jpAdmin from "./locales/jp/admin.json";
import viFavorites from "./locales/vi/favorites.json";
import jpFavorites from "./locales/jp/favorites.json";

const stored =
  typeof window !== "undefined" ? localStorage.getItem("lang") : null;
const initialLng = stored || "vi";

i18n.use(initReactI18next).init({
  lng: initialLng,
  fallbackLng: "vi",
  debug: false,
  defaultNS: "homepage",
  ns: ["homepage", "sidebar"],
  resources: {
    vi: { homepage: viHomepage, sidebar: viSidebar, admin: viAdmin, favorites: viFavorites },
    jp: { homepage: jpHomepage, sidebar: jpSidebar, admin: jpAdmin, favorites: jpFavorites },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
