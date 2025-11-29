import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // App Name
      appName: "FINOTE",
      
      // Navigation
      dashboard: "Dashboard",
      expenses: "Expenses",
      subscriptions: "Subscriptions",
      goals: "Goals",
      priceTracker: "Price Tracker",
      aiTwin: "AI Twin",
      settings: "Settings",
      leaderboard: "Leaderboard",
      budgets: "Budgets",
      recurring: "Recurring",
      calendar: "Calendar",
      debts: "Debts",
      merchants: "Merchants",
      reports: "Reports",
      badges: "Badges",
      
      // Dashboard
      dashboardTitle: "Dashboard",
      totalIncome: "Total Income",
      totalExpenses: "Total Expenses",
      totalSavings: "Total Savings",
      savingsRate: "Savings Rate",
      spendingTrends: "Spending Trends",
      categoryBreakdown: "Category Breakdown",
      monthlySubscriptions: "Monthly Subscriptions",
      regretPurchases: "Regret Purchases",
      averageDailySpend: "Average Daily Spend",
      voiceExpense: "Voice Expense",
      scanReceipt: "Scan Receipt",
      
      // Common
      add: "Add",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      loading: "Loading...",
      error: "Error",
      success: "Success!",
      confirm: "Confirm",
      back: "Back",
      next: "Next",
      submit: "Submit",
      close: "Close",
      
      // Expenses
      addExpense: "Add Expense",
      amount: "Amount",
      category: "Category",
      description: "Description",
      merchant: "Merchant",
      date: "Date",
      
      // Categories
      food: "Food",
      transport: "Transport",
      shopping: "Shopping",
      entertainment: "Entertainment",
      healthcare: "Healthcare",
      bills: "Bills",
      other: "Other",
      
      // Settings
      settingsTitle: "Settings",
      language: "Language",
      personalityMode: "Personality Mode",
      darkMode: "Dark Mode",
      currency: "Currency",
      notifications: "Notifications",
      
      // Personality Modes
      balanced: "Balanced",
      saver: "Saver",
      spender: "Spender",
      minimalist: "Minimalist",
      adventurous: "Adventurous",
      foodie: "Foodie",
      
      // Debts
      debtManagement: "Debt Management",
      addDebt: "Add Debt",
      debtName: "Debt Name",
      principalAmount: "Principal Amount",
      interestRate: "Interest Rate (%)",
      tenureMonths: "Tenure (Months)",
      emiAmount: "EMI Amount",
      totalInterest: "Total Interest",
      totalPayable: "Total Payable",
      
      // Badges
      badgesAndMilestones: "Badges & Milestones",
      earnedBadges: "Earned Badges",
      noBadgesYet: "No badges yet. Keep tracking!",
      
      // Reports
      weeklyReport: "Weekly Report",
      generateReport: "Generate Report",
      emailReport: "Email Report",
      
      // AI Features
      financialStory: "Financial Story",
      habitCorrection: "Habit Correction",
      emotionalSpending: "Emotional Spending Analysis",
      generateStory: "Generate Story",
      analyzeHabits: "Analyze Habits",
      predictEmotions: "Predict Emotional Patterns"
    }
  },
  hi: {
    translation: {
      // App Name
      appName: "फिनोट",
      
      // Navigation
      dashboard: "डैशबोर्ड",
      expenses: "खर्च",
      subscriptions: "सदस्यता",
      goals: "लक्ष्य",
      priceTracker: "मूल्य ट्रैकर",
      aiTwin: "AI ट्विन",
      settings: "सेटिंग्स",
      leaderboard: "लीडरबोर्ड",
      budgets: "बजट",
      recurring: "आवर्ती",
      calendar: "कैलेंडर",
      debts: "ऋण",
      merchants: "व्यापारी",
      reports: "रिपोर्ट",
      badges: "बैज",
      
      // Dashboard
      dashboardTitle: "डैशबोर्ड",
      totalIncome: "कुल आय",
      totalExpenses: "कुल खर्च",
      totalSavings: "कुल बचत",
      savingsRate: "बचत दर",
      spendingTrends: "खर्च के रुझान",
      categoryBreakdown: "श्रेणी विवरण",
      monthlySubscriptions: "मासिक सदस्यता",
      regretPurchases: "पछतावा खरीद",
      averageDailySpend: "औसत दैनिक खर्च",
      voiceExpense: "वॉयस खर्च",
      scanReceipt: "रसीद स्कैन करें",
      
      // Common
      add: "जोड़ें",
      edit: "संपादित करें",
      delete: "हटाएं",
      save: "सहेजें",
      cancel: "रद्द करें",
      loading: "लोड हो रहा है...",
      error: "त्रुटि",
      success: "सफलता!",
      confirm: "पुष्टि करें",
      back: "पीछे",
      next: "आगे",
      submit: "जमा करें",
      close: "बंद करें",
      
      // Expenses
      addExpense: "खर्च जोड़ें",
      amount: "राशि",
      category: "श्रेणी",
      description: "विवरण",
      merchant: "व्यापारी",
      date: "तारीख",
      
      // Categories
      food: "भोजन",
      transport: "परिवहन",
      shopping: "खरीदारी",
      entertainment: "मनोरंजन",
      healthcare: "स्वास्थ्य",
      bills: "बिल",
      other: "अन्य",
      
      // Settings
      settingsTitle: "सेटिंग्स",
      language: "भाषा",
      personalityMode: "व्यक्तित्व मोड",
      darkMode: "डार्क मोड",
      currency: "मुद्रा",
      notifications: "सूचनाएं",
      
      // Personality Modes
      balanced: "संतुलित",
      saver: "बचतकर्ता",
      spender: "खर्चीला",
      minimalist: "सादगीपसंद",
      adventurous: "साहसी",
      foodie: "खाने का शौकीन",
      
      // Debts
      debtManagement: "ऋण प्रबंधन",
      addDebt: "ऋण जोड़ें",
      debtName: "ऋण का नाम",
      principalAmount: "मूल राशि",
      interestRate: "ब्याज दर (%)",
      tenureMonths: "अवधि (महीने)",
      emiAmount: "EMI राशि",
      totalInterest: "कुल ब्याज",
      totalPayable: "कुल भुगतान",
      
      // Badges
      badgesAndMilestones: "बैज और मील के पत्थर",
      earnedBadges: "अर्जित बैज",
      noBadgesYet: "अभी तक कोई बैज नहीं। ट्रैकिंग जारी रखें!",
      
      // Reports
      weeklyReport: "साप्ताहिक रिपोर्ट",
      generateReport: "रिपोर्ट बनाएं",
      emailReport: "ईमेल रिपोर्ट",
      
      // AI Features
      financialStory: "वित्तीय कहानी",
      habitCorrection: "आदत सुधार",
      emotionalSpending: "भावनात्मक खर्च विश्लेषण",
      generateStory: "कहानी बनाएं",
      analyzeHabits: "आदतों का विश्लेषण करें",
      predictEmotions: "भावनात्मक पैटर्न की भविष्यवाणी"
    }
  },
  te: {
    translation: {
      appName: "ఫినోట్",
      dashboard: "డ్యాష్‌బోర్డ్",
      expenses: "ఖర్చులు",
      subscriptions: "చందాలు",
      goals: "లక్ష్యాలు",
      addExpense: "ఖర్చు జోడించండి",
      amount: "మొత్తం",
      category: "వర్గం",
      description: "వివరణ",
      save: "భద్రపరచండి",
      cancel: "రద్దు చేయండి",
      loading: "లోడ్ అవుతోంది..."
    }
  },
  ta: {
    translation: {
      appName: "ஃபினோட்",
      dashboard: "டாஷ்போர்டு",
      expenses: "செலவுகள்",
      subscriptions: "சந்தாக்கள்",
      goals: "இலக்குகள்",
      addExpense: "செலவு சேர்க்கவும்",
      amount: "தொகை",
      category: "வகை",
      description: "விளக்கம்",
      save: "சேமி",
      cancel: "ரத்து செய்",
      loading: "ஏற்றுகிறது..."
    }
  },
  kn: {
    translation: {
      appName: "ಫಿನೋಟ್",
      dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      expenses: "ವೆಚ್ಚಗಳು",
      subscriptions: "ಚಂದಾದಾರಿಕೆಗಳು",
      goals: "ಗುರಿಗಳು",
      addExpense: "ವೆಚ್ಚವನ್ನು ಸೇರಿಸಿ",
      amount: "ಮೊತ್ತ",
      category: "ವರ್ಗ",
      description: "ವಿವರಣೆ",
      save: "ಉಳಿಸಿ",
      cancel: "ರದ್ದುಮಾಡಿ",
      loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ..."
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
