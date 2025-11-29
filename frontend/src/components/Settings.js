import { useState, useEffect } from 'react';
import axios from 'axios';
import { Moon, Sun, Globe, LogOut, User, Bell, Languages } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { useTranslation } from 'react-i18next';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Settings = ({ darkMode, setDarkMode, currency, setCurrency }) => {
  const { t, i18n } = useTranslation();
  const [preferences, setPreferences] = useState({
    personality_mode: 'Balanced',
    language: 'en',
    spending_alerts: true
  });
  const [loading, setLoading] = useState(false);

  const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' }
  ];

  const personalityModes = [
    { value: 'Balanced', emoji: '⚖️', description: 'Balanced approach to spending and saving' },
    { value: 'Saver', emoji: '💰', description: 'Focus on saving and minimizing expenses' },
    { value: 'Spender', emoji: '🛍️', description: 'Enjoy spending on experiences' },
    { value: 'Minimalist', emoji: '🌱', description: 'Keep expenses minimal and essential' },
    { value: 'Adventurous', emoji: '🎢', description: 'Willing to take financial risks' },
    { value: 'Foodie', emoji: '🍕', description: 'Love spending on food and dining' }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' }
  ];

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get(`${API}/preferences`);
      setPreferences(response.data);
      i18n.changeLanguage(response.data.language);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const updatePreferences = async (field, value) => {
    setLoading(true);
    try {
      const updated = { ...preferences, [field]: value };
      await axios.post(`${API}/preferences`, updated);
      setPreferences(updated);
      
      if (field === 'language') {
        i18n.changeLanguage(value);
      }
      
      toast.success('Preferences updated!');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8" data-testid="settings-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text">{t('settingsTitle')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Customize your FINOTE experience</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Dark Mode */}
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon size={24} className="text-blue-500" /> : <Sun size={24} className="text-yellow-500" />}
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-200">{t('darkMode')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark/light theme</p>
              </div>
            </div>
            <Button
              data-testid="toggle-dark-mode"
              onClick={() => setDarkMode(!darkMode)}
              className={darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-yellow-500 hover:bg-yellow-600'}
            >
              {darkMode ? 'Dark' : 'Light'}
            </Button>
          </div>
        </div>

        {/* Language */}
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Languages size={24} className="text-purple-500" />
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200">{t('language')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred language</p>
            </div>
          </div>
          <Select 
            value={preferences.language} 
            onValueChange={(value) => updatePreferences('language', value)}
            disabled={loading}
          >
            <SelectTrigger data-testid="language-selector" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Personality Mode */}
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <User size={24} className="text-green-500" />
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200">{t('personalityMode')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Personalize your financial insights</p>
            </div>
          </div>
          <Select 
            value={preferences.personality_mode} 
            onValueChange={(value) => updatePreferences('personality_mode', value)}
            disabled={loading}
          >
            <SelectTrigger data-testid="personality-mode-selector" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {personalityModes.map(mode => (
                <SelectItem key={mode.value} value={mode.value}>
                  {mode.emoji} {mode.value} - {mode.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Spending Alerts */}
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={24} className="text-orange-500" />
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-200">Spending Alerts</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about spending patterns</p>
              </div>
            </div>
            <Switch
              data-testid="spending-alerts-toggle"
              checked={preferences.spending_alerts}
              onCheckedChange={(checked) => updatePreferences('spending_alerts', checked)}
            />
          </div>
        </div>

        {/* Currency */}
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Globe size={24} className="text-blue-500" />
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200">{t('currency')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferred currency</p>
            </div>
          </div>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger data-testid="currency-selector" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(curr => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.name} ({curr.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Account */}
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogOut size={24} className="text-red-500" />
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-200">Account</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sign out of your account</p>
              </div>
            </div>
            <Button
              data-testid="sign-out-btn"
              variant="destructive"
              className="bg-red-500 hover:bg-red-600"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* About */}
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3">About FINOTE</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Version:</strong> 2.0.0</p>
            <p><strong>Build:</strong> Production</p>
            <p className="pt-2">FINOTE is your comprehensive financial intelligence platform with AI-powered insights, helping you track expenses, manage subscriptions, set goals, and make smarter financial decisions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
