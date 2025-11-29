import { useState, useEffect } from 'react';
import { Moon, Sun, Globe, Save, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const Settings = ({ darkMode, setDarkMode, currency, setCurrency }) => {
  const [preferences, setPreferences] = useState({
    notifications: true,
    emailAlerts: true,
    darkMode: darkMode,
    currency: currency,
    language: 'en',
    theme: 'blue'
  });

  // Load preferences from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    if (Object.keys(saved).length > 0) {
      setPreferences({ ...preferences, ...saved });
    }
  }, []);

  // Save preferences to localStorage
  const saveSettings = () => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    setDarkMode(preferences.darkMode);
    setCurrency(preferences.currency);
    toast.success('Settings saved successfully!');
  };

  const handleChange = (key, value) => {
    setPreferences({ ...preferences, [key]: value });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Customize your Finote experience</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Display Settings */}
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Display Settings</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {preferences.darkMode ? <Moon size={24} /> : <Sun size={24} />}
                <div>
                  <p className="font-semibold">Dark Mode</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Use dark theme</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.darkMode}
                onChange={(e) => handleChange('darkMode', e.target.checked)}
                className="w-6 h-6 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Theme Color</label>
              <select
                value={preferences.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="purple">Purple</option>
                <option value="orange">Orange</option>
              </select>
            </div>
          </div>
        </div>

        {/* Currency & Language */}
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Localization</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Globe size={20} /> Currency
              </label>
              <select
                value={preferences.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Language</label>
              <select
                value={preferences.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Bell size={24} /> Notifications
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Push Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get app notifications</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifications}
                onChange={(e) => handleChange('notifications', e.target.checked)}
                className="w-6 h-6 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Email Alerts</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive email updates</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailAlerts}
                onChange={(e) => handleChange('emailAlerts', e.target.checked)}
                className="w-6 h-6 rounded"
              />
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Account</h2>
          
          <div className="space-y-4">
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">Change Password</Button>
            <Button className="w-full bg-red-500 hover:bg-red-600 text-white">Clear All Data</Button>
            <Button className="w-full bg-green-500 hover:bg-green-600 text-white">Export Data</Button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex gap-4">
        <Button onClick={saveSettings} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg flex items-center gap-2">
          <Save size={20} />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;
