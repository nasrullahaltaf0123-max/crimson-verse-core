import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Lang = "en" | "bn";

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  // Navbar
  "nav.search": { en: "Search Donors", bn: "ডোনার খুঁজুন" },
  "nav.urgent": { en: "Urgent", bn: "জরুরি" },
  "nav.profile": { en: "My Profile", bn: "আমার প্রোফাইল" },
  "nav.join": { en: "Join as Donor", bn: "ডোনার হন" },
  "nav.theme": { en: "Toggle theme", bn: "থিম পরিবর্তন" },

  // Hero
  "hero.tagline": { en: "A drop can write another life.", bn: "এক ফোঁটা রক্ত লিখতে পারে আরেকটি জীবন।" },
  "hero.join": { en: "Join as Donor", bn: "ডোনার হন" },

  // Urgent
  "urgent.title": { en: "Emergency Request", bn: "জরুরি অনুরোধ" },
  "urgent.post": { en: "Post Emergency Request", bn: "জরুরি অনুরোধ পোস্ট করুন" },
  "urgent.patient": { en: "Patient Name", bn: "রোগীর নাম" },
  "urgent.hospital": { en: "Hospital / Clinic", bn: "হাসপাতাল / ক্লিনিক" },
  "urgent.contact": { en: "Contact Number", bn: "যোগাযোগ নম্বর" },
  "urgent.bloodGroup": { en: "Blood Group Needed", bn: "প্রয়োজনীয় রক্তের গ্রুপ" },
  "urgent.units": { en: "Units Needed", bn: "ইউনিট প্রয়োজন" },
  "urgent.urgency": { en: "Urgency", bn: "জরুরিতা" },
  "urgent.area": { en: "Current Area", bn: "বর্তমান এলাকা" },
  "urgent.notes": { en: "Notes", bn: "নোট" },
  "urgent.cancel": { en: "Cancel", bn: "বাতিল" },

  // Success
  "success.title": { en: "You're In!", bn: "আপনি যুক্ত হয়েছেন!" },
  "success.share": { en: "Help your batchmates join too", bn: "আপনার বন্ধুদেরও যুক্ত করুন" },
  "success.copyLink": { en: "Copy Link to Share", bn: "লিংক কপি করুন" },
  "success.viewProfile": { en: "View My Donor Profile", bn: "আমার ডোনার প্রোফাইল দেখুন" },

  // Search
  "search.title": { en: "The Life Search", bn: "জীবন অন্বেষণ" },
  "search.subtitle": { en: "Every drop is a story waiting to continue.", bn: "প্রতিটি ফোঁটা একটি অসমাপ্ত গল্প।" },
  "search.available": { en: "Available Donors", bn: "উপলব্ধ ডোনার" },
  "search.noResults": { en: "No donors found", bn: "কোন ডোনার পাওয়া যায়নি" },

  // Spam
  "spam.wait": { en: "Please wait before posting another request.", bn: "আরেকটি অনুরোধ পোস্ট করতে অপেক্ষা করুন।" },
  "spam.duplicate": { en: "An active request already exists.", bn: "একটি সক্রিয় অনুরোধ ইতিমধ্যে আছে।" },

  // Footer
  "footer.crafted": { en: "Crafted With Purpose", bn: "উদ্দেশ্যমূলকভাবে তৈরি" },
  "footer.nav": { en: "Navigation", bn: "নেভিগেশন" },
  "footer.dept": { en: "Department", bn: "বিভাগ" },

  // Common
  "common.call": { en: "Call", bn: "কল" },
  "common.available": { en: "Available Now", bn: "এখন উপলব্ধ" },
  "common.unavailable": { en: "Unavailable", bn: "অনুপলব্ধ" },
};

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export const useI18n = () => useContext(I18nContext);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem("cv_lang") as Lang) || "en";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("cv_lang", l);
  };

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};
