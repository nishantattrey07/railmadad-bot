import { create } from "zustand";
const useLanguageStore = create((set) => ({
  language: 'en', // Default language
  setLanguage: (newLanguage) => set({ language: newLanguage }),
}));

export default useLanguageStore;
