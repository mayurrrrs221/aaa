import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import "./i18n"; // Import i18n configuration
import Dashboard from "./components/Dashboard";
import Expenses from "./components/Expenses";
import Subscriptions from "./components/Subscriptions";
import Goals from "./components/Goals";
import PriceTracker from "./components/PriceTracker";
import AITwin from "./components/AITwin";
import Settings from "./components/Settings";
import Leaderboard from "./components/Leaderboard";
import BudgetManager from "./components/BudgetManager";
import RecurringTransactions from "./components/RecurringTransactions";
import FinancialCalendar from "./components/Calendar";
import DebtManager from "./components/DebtManager";
import MerchantInsights from "./components/MerchantInsights";
import WeeklyReports from "./components/WeeklyReports";
import BadgesPage from "./components/BadgesPage";
import AIFeatures from "./components/AIFeatures";
import QuickAddButton from "./components/QuickAddButton";
import LifestyleRecommendations from "./components/LifestyleRecommendations";
import BehaviourAlerts from "./components/BehaviourAlerts";
import CategoryInsights from "./components/CategoryInsights";
import Sidebar from "./components/Sidebar";
import { Toaster } from "./components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true' || false;
  });
  
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'INR';
  });
  
  const [exchangeRates, setExchangeRates] = useState({
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
    AED: 0.044
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const convertCurrency = (amount, fromCurrency = 'INR') => {
    if (fromCurrency === currency) return amount;
    const inINR = amount / exchangeRates[fromCurrency];
    return inINR * exchangeRates[currency];
  };

  const formatCurrency = (amount) => {
    const symbols = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
      AED: 'د.إ'
    };
    return `${symbols[currency]}${amount.toFixed(2)}`;
  };

  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <div className="flex min-h-screen">
          <Sidebar darkMode={darkMode} />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={
                <Dashboard 
                  currency={currency} 
                  convertCurrency={convertCurrency}
                  formatCurrency={formatCurrency}
                />
              } />
              <Route path="/expenses" element={
                <Expenses 
                  currency={currency}
                  convertCurrency={convertCurrency}
                  formatCurrency={formatCurrency}
                />
              } />
              <Route path="/subscriptions" element={
                <Subscriptions 
                  currency={currency}
                  formatCurrency={formatCurrency}
                />
              } />
              <Route path="/goals" element={
                <Goals 
                  currency={currency}
                  formatCurrency={formatCurrency}
                />
              } />
              <Route path="/price-tracker" element={
                <PriceTracker 
                  currency={currency}
                  formatCurrency={formatCurrency}
                />
              } />
              <Route path="/ai-twin" element={<AITwin />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/budget-manager" element={
                <BudgetManager 
                  currency={currency}
                  formatCurrency={formatCurrency}
                />
              } />
              <Route path="/recurring" element={
                <RecurringTransactions 
                  currency={currency}
                  formatCurrency={formatCurrency}
                />
              } />
              <Route path="/calendar" element={
                <FinancialCalendar 
                  currency={currency}
                  formatCurrency={formatCurrency}
                />
              } />
              <Route path="/settings" element={
                <Settings 
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                  currency={currency}
                  setCurrency={setCurrency}
                />
              } />
              <Route path="/debts" element={
                <DebtManager 
                  currency={currency}
                  formatCurrency={formatCurrency}
                />
              } />
              <Route path="/merchants" element={
                <MerchantInsights 
                  currency={currency}
                  formatCurrency={formatCurrency}
                />
              } />
              <Route path="/reports" element={
                <WeeklyReports 
                  currency={currency}
                  formatCurrency={formatCurrency}
                />
              } />
              <Route path="/badges" element={<BadgesPage />} />
              <Route path="/ai-features" element={<AIFeatures />} />
              <Route path="/recommendations" element={
                <LifestyleRecommendations 
                  currency={currency}
                  formatCurrency={formatCurrency}
                />
              } />
              <Route path="/behaviour-alerts" element={
                <BehaviourAlerts 
                  currency={currency}
                  formatCurrency={formatCurrency}
                />
              } />
              <Route path="/category-insights" element={
                <CategoryInsights 
                  currency={currency}
                  formatCurrency={formatCurrency}
                />
              } />
            </Routes>
            <QuickAddButton />
          </main>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;