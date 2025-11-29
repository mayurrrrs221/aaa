import { Link, useLocation } from 'react-router-dom';
import { 
  Home, CreditCard, Repeat, Target, TrendingUp, MessageCircle, Trophy, Settings, 
  PiggyBank, Calendar, RefreshCw, Store, FileText, Award, Sparkles, AlertCircle, 
  Lightbulb, BarChart3, DollarSign 
} from 'lucide-react';

const Sidebar = ({ darkMode }) => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/expenses', icon: CreditCard, label: 'Expenses' },
    { path: '/subscriptions', icon: Repeat, label: 'Subscriptions' },
    { path: '/goals', icon: Target, label: 'Goals' },
    { path: '/budget-manager', icon: PiggyBank, label: 'Budgets' },
    { path: '/recurring', icon: RefreshCw, label: 'Recurring' },
    { path: '/debts', icon: DollarSign, label: 'Debt Manager' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/price-tracker', icon: TrendingUp, label: 'Price Tracker' },
    { path: '/merchants', icon: Store, label: 'Merchants' },
    { path: '/category-insights', icon: BarChart3, label: 'Category Insights' },
    { path: '/behaviour-alerts', icon: AlertCircle, label: 'Behaviour Alerts' },
    { path: '/recommendations', icon: Lightbulb, label: 'Recommendations' },
    { path: '/reports', icon: FileText, label: 'Weekly Reports' },
    { path: '/badges', icon: Award, label: 'Badges' },
    { path: '/ai-twin', icon: MessageCircle, label: 'AI Twin' },
    { path: '/ai-features', icon: Sparkles, label: 'AI Features' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];
  
  return (
    <aside className="w-64 glass-effect shadow-xl flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold gradient-text">FINOTE</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">AI Financial Intelligence</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
            U
          </div>
          <div>
            <p className="font-medium text-sm text-gray-800 dark:text-gray-200">User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Premium Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;