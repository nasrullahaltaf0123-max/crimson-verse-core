import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Lang = "en" | "bn";

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  isBn: boolean;
}

const translations: Record<string, Record<Lang, string>> = {
  // Navbar
  "nav.search": { en: "Search Donors", bn: "ডোনার খুঁজুন" },
  "nav.urgent": { en: "Urgent", bn: "জরুরি" },
  "nav.profile": { en: "My Profile", bn: "আমার প্রোফাইল" },
  "nav.join": { en: "Join as Donor", bn: "ডোনার হন" },
  "nav.theme": { en: "Toggle theme", bn: "থিম পরিবর্তন" },
  "nav.dashboard": { en: "Dashboard", bn: "ড্যাশবোর্ড" },

  // Hero
  "hero.badge": { en: "BM College English Department", bn: "বিএম কলেজ ইংরেজি বিভাগ" },
  "hero.title1": { en: "Your Blood", bn: "আপনার রক্ত" },
  "hero.title2": { en: "Can Save Lives", bn: "বাঁচাতে পারে জীবন" },
  "hero.subtitle": { en: "Join your classmates in building a", bn: "আপনার সহপাঠীদের সাথে তৈরি করুন একটি" },
  "hero.subtitleHighlight": { en: "life-saving community", bn: "জীবন রক্ষাকারী সম্প্রদায়" },
  "hero.subtitleEnd": { en: ". Add your blood info in 30 seconds.", bn: "। ৩০ সেকেন্ডে আপনার রক্তের তথ্য যোগ করুন।" },
  "hero.joinBtn": { en: "Add Yourself as Donor", bn: "ডোনার হিসেবে যুক্ত হন" },
  "hero.searchBtn": { en: "Search Donor", bn: "ডোনার খুঁজুন" },
  "hero.tagline": { en: "A drop can write another life.", bn: "এক ফোঁটা রক্ত লিখতে পারে আরেকটি জীবন।" },
  "hero.studentDonors": { en: "Student Donors", bn: "ছাত্র ডোনার" },

  // Stats
  "stats.availableNow": { en: "Available Now", bn: "এখন উপলব্ধ" },
  "stats.activeDonors": { en: "Active Donors", bn: "সক্রিয় ডোনার" },
  "stats.requestsSolved": { en: "Requests Solved", bn: "অনুরোধ সমাধান" },
  "stats.storiesContinued": { en: "Stories Continued", bn: "গল্প অব্যাহত" },
  "stats.rareHeroes": { en: "Rare Blood Heroes", bn: "বিরল রক্তের বীর" },
  "stats.negativeGroups": { en: "Negative Groups", bn: "নেগেটিভ গ্রুপ" },

  // Quote section
  "quote.title": { en: "The English Department Pulse", bn: "ইংরেজি বিভাগের স্পন্দন" },
  "quote.desc": { en: "Tracking our community's contribution toward the annual blood drive goal. Every unit donated is a line in our shared history.", bn: "আমাদের সম্প্রদায়ের বার্ষিক রক্তদান লক্ষ্যের অগ্রগতি। প্রতিটি ইউনিট রক্তদান আমাদের ভাগ করা ইতিহাসের একটি লাইন।" },
  "quote.donorsJoined": { en: "Donors Joined", bn: "ডোনার যুক্ত" },
  "quote.goal": { en: "Goal", bn: "লক্ষ্য" },
  "quote.emergencyHub": { en: "Emergency Hub", bn: "জরুরি কেন্দ্র" },
  "quote.emergencyDesc": { en: "Immediate access to rare blood group contacts and emergency logistics.", bn: "বিরল রক্তের গ্রুপের যোগাযোগ এবং জরুরি সহায়তায় তাৎক্ষণিক প্রবেশাধিকার।" },
  "quote.openSOS": { en: "Open SOS Center", bn: "SOS কেন্দ্র খুলুন" },

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
  "urgent.heroTitle": { en: "Emergency Blood Requests", bn: "জরুরি রক্তের অনুরোধ" },
  "urgent.heroSubtitle": { en: "Every second counts. Every drop matters.", bn: "প্রতিটি সেকেন্ড গুরুত্বপূর্ণ। প্রতিটি ফোঁটা মূল্যবান।" },
  "urgent.bloodNeeded": { en: "Urgent Blood Needed", bn: "জরুরি রক্ত প্রয়োজন" },
  "urgent.trustTitle": { en: "Trust & Safety", bn: "বিশ্বাস ও নিরাপত্তা" },

  // Search
  "search.title": { en: "The Life Search", bn: "জীবন অন্বেষণ" },
  "search.subtitle": { en: "Every drop is a story waiting to continue. Filter through our community of student donors to find your literal lifeline.", bn: "প্রতিটি ফোঁটা একটি অসমাপ্ত গল্প। আপনার জীবন রেখা খুঁজে পেতে আমাদের ছাত্র ডোনার সম্প্রদায়ে অনুসন্ধান করুন।" },
  "search.available": { en: "Available Donors", bn: "উপলব্ধ ডোনার" },
  "search.noResults": { en: "No donors found", bn: "কোন ডোনার পাওয়া যায়নি" },
  "search.adjustFilters": { en: "Try adjusting your filters.", bn: "আপনার ফিল্টার পরিবর্তন করে দেখুন।" },
  "search.selectBlood": { en: "Select Blood Group", bn: "রক্তের গ্রুপ নির্বাচন করুন" },
  "search.liveStatus": { en: "Live Status", bn: "লাইভ স্ট্যাটাস" },
  "search.activeDonors": { en: "Active Donors", bn: "সক্রিয় ডোনার" },
  "search.batch": { en: "Departmental Batch", bn: "বিভাগীয় ব্যাচ" },
  "search.gender": { en: "Gender", bn: "লিঙ্গ" },
  "search.availableOnly": { en: "Available Only", bn: "শুধু উপলব্ধ" },
  "search.showImmediate": { en: "Show immediate donors", bn: "তাৎক্ষণিক ডোনার দেখুন" },
  "search.filters": { en: "Filters", bn: "ফিল্টার" },
  "search.showResults": { en: "Show Results", bn: "ফলাফল দেখুন" },

  // Success
  "success.title": { en: "You're In!", bn: "আপনি যুক্ত হয়েছেন!" },
  "success.share": { en: "Help your batchmates join too", bn: "আপনার বন্ধুদেরও যুক্ত করুন" },
  "success.copyLink": { en: "Copy Link to Share", bn: "শেয়ার করতে লিংক কপি করুন" },
  "success.viewProfile": { en: "View My Donor Profile", bn: "আমার ডোনার প্রোফাইল দেখুন" },

  // Profile
  "profile.title": { en: "My Donor Profile", bn: "আমার ডোনার প্রোফাইল" },
  "profile.subtitle": { en: "Access your profile, update availability, and track your donation history.", bn: "আপনার প্রোফাইল দেখুন, উপলব্ধতা আপডেট করুন এবং রক্তদানের ইতিহাস ট্র্যাক করুন।" },
  "profile.findTitle": { en: "Find Your Profile", bn: "আপনার প্রোফাইল খুঁজুন" },
  "profile.findDesc": { en: "Enter the phone number you registered with.", bn: "আপনার নিবন্ধিত ফোন নম্বর দিন।" },
  "profile.availableToggle": { en: "Available to donate", bn: "রক্তদানে প্রস্তুত" },
  "profile.visible": { en: "You're visible to requesters", bn: "অনুরোধকারীরা আপনাকে দেখতে পাবে" },
  "profile.hidden": { en: "You won't appear in matches", bn: "আপনি ম্যাচে দেখা যাবে না" },
  "profile.donations": { en: "Donations", bn: "রক্তদান" },
  "profile.units": { en: "Units", bn: "ইউনিট" },
  "profile.eligibility": { en: "Eligibility", bn: "যোগ্যতা" },
  "profile.history": { en: "Donation History", bn: "রক্তদানের ইতিহাস" },
  "profile.noHistory": { en: "No donations recorded yet.", bn: "এখনো কোনো রক্তদান রেকর্ড হয়নি।" },
  "profile.historyDesc": { en: "Your donation history will appear here after you help someone.", bn: "কাউকে সাহায্য করার পর আপনার রক্তদানের ইতিহাস এখানে দেখা যাবে।" },
  "profile.link": { en: "Your Profile Link", bn: "আপনার প্রোফাইল লিংক" },
  "profile.linkDesc": { en: "Bookmark this to access your profile anytime — no login needed.", bn: "যেকোনো সময় প্রোফাইলে প্রবেশ করতে এই লিংক সংরক্ষণ করুন।" },
  "profile.copyLink": { en: "Copy My Profile Link", bn: "আমার প্রোফাইল লিংক কপি করুন" },

  // Spam
  "spam.wait": { en: "Please wait before posting another request.", bn: "আরেকটি অনুরোধ পোস্ট করতে অপেক্ষা করুন।" },
  "spam.duplicate": { en: "An active request already exists.", bn: "একটি সক্রিয় অনুরোধ ইতিমধ্যে আছে।" },

  // Footer
  "footer.crafted": { en: "Crafted With Purpose", bn: "উদ্দেশ্যপ্রণোদিত সৃষ্টি" },
  "footer.nav": { en: "Navigation", bn: "নেভিগেশন" },
  "footer.dept": { en: "Department", bn: "বিভাগ" },
  "footer.search": { en: "Search Donors", bn: "ডোনার খুঁজুন" },
  "footer.urgent": { en: "Urgent Requests", bn: "জরুরি অনুরোধ" },
  "footer.joinCommunity": { en: "Join the Community", bn: "সম্প্রদায়ে যোগ দিন" },
  "footer.dashboard": { en: "Dashboard", bn: "ড্যাশবোর্ড" },
  "footer.deptDesc": { en: "BM College, English Department", bn: "বিএম কলেজ, ইংরেজি বিভাগ" },
  "footer.deptSubDesc": { en: "Building a community where every drop matters.", bn: "এমন একটি সম্প্রদায় গড়ে তোলা যেখানে প্রতিটি ফোঁটার মূল্য আছে।" },
  "footer.copyright": { en: "© 2024 Crimson Verse Editorial Department. All contributions are vital stories.", bn: "© ২০২৪ ক্রিমসন ভার্স সম্পাদনা বিভাগ। প্রতিটি অবদান একটি গুরুত্বপূর্ণ গল্প।" },
  "footer.devDesc": { en: "Department of English, Gov't BM College — Designed and developed to turn compassion into connection.", bn: "ইংরেজি বিভাগ, সরকারি বিএম কলেজ — সহানুভূতিকে সংযোগে রূপান্তরিত করতে ডিজাইন ও উন্নয়ন করা হয়েছে।" },
  "footer.portfolio": { en: "Visit Portfolio", bn: "পোর্টফোলিও দেখুন" },

  // Floating CTA
  "cta.urgentBlood": { en: "Urgent Blood Needed", bn: "জরুরি রক্ত প্রয়োজন" },
  "cta.addBlood": { en: "Add My Blood Info", bn: "আমার রক্তের তথ্য যোগ করুন" },
  "cta.join": { en: "Join", bn: "যোগ দিন" },

  // Common
  "common.call": { en: "Call", bn: "কল" },
  "common.available": { en: "Available Now", bn: "এখন উপলব্ধ" },
  "common.unavailable": { en: "Unavailable", bn: "অনুপলব্ধ" },
  "common.loading": { en: "Loading...", bn: "লোড হচ্ছে..." },
  "common.showing": { en: "Showing", bn: "দেখাচ্ছে" },
  "common.match": { en: "Match", bn: "ম্যাচ" },
  "common.matches": { en: "Matches", bn: "ম্যাচ" },
  "common.clear": { en: "Clear", bn: "মুছুন" },
  "common.find": { en: "Find", bn: "খুঁজুন" },
  "common.any": { en: "Any", bn: "যেকোনো" },
  "common.male": { en: "Male", bn: "পুরুষ" },
  "common.female": { en: "Female", bn: "মহিলা" },
};

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
  isBn: false,
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

  const isBn = lang === "bn";

  useEffect(() => {
    document.documentElement.lang = lang;
    // Add/remove Bangla font class on root
    if (lang === "bn") {
      document.documentElement.classList.add("lang-bn");
    } else {
      document.documentElement.classList.remove("lang-bn");
    }
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isBn }}>
      {children}
    </I18nContext.Provider>
  );
};
