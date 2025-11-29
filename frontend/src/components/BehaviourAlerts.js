import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, TrendingUp, Clock, Calendar, RefreshCw } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BehaviourAlerts = ({ currency, formatCurrency }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBehaviourAnalytics();
  }, []);

  const fetchBehaviourAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/analytics/behaviour`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching behaviour analytics:', error);
      toast.error('Failed to load behaviour analytics');
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'high_spending_day':
        return Calendar;
      case 'late_night_ordering':
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'high_spending_day':
        return 'from-orange-400 to-orange-600';
      case 'late_night_ordering':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-red-400 to-red-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weekdayData = weekdays.map(day => ({
    day,
    amount: analytics?.patterns?.weekday_spending?.[day] || 0
  }));

  return (
    <div className="p-8 space-y-6" data-testid="behaviour-alerts">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Behaviour-Based Alerts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Smart spending pattern detection and warnings
          </p>
        </div>
        <Button 
          onClick={fetchBehaviourAnalytics} 
          data-testid="refresh-alerts-btn"
          className="bg-gradient-to-r from-orange-500 to-red-600"
        >
          <RefreshCw className="mr-2" size={18} />
          Refresh
        </Button>
      </div>

      {/* Active Alerts */}
      {analytics?.alerts && analytics.alerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Active Alerts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.alerts.map((alert, index) => {
              const Icon = getAlertIcon(alert.type);
              return (
                <Card 
                  key={index} 
                  className="p-6 border-l-4 border-orange-500"
                  data-testid={`alert-${index}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${getAlertColor(alert.type)} shadow-lg`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="text-orange-500" size={18} />
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">
                          {alert.type.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </h3>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {alert.message}
                      </p>
                      {alert.day && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Highest spending day: {alert.day}
                        </p>
                      )}
                      {alert.count && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {alert.count} instances detected
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Spending Patterns */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Weekday Spending Pattern</h2>
        <div className="space-y-3">
          {weekdayData.map((item) => {
            const maxAmount = Math.max(...weekdayData.map(d => d.amount));
            const percentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
            const isHighSpending = percentage > 75;
            
            return (
              <div key={item.day} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{item.day}</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHighSpending 
                        ? 'bg-gradient-to-r from-red-400 to-red-600' 
                        : 'bg-gradient-to-r from-blue-400 to-blue-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Spending Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="text-purple-500" size={24} />
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Late Night Orders</h3>
          </div>
          <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
            {analytics?.patterns?.late_night_orders || 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Purchases between 10 PM - 4 AM
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="text-orange-500" size={24} />
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Weekend Spending</h3>
          </div>
          <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(analytics?.patterns?.weekend_spending || 0)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Total spent on Sat-Sun
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="text-blue-500" size={24} />
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Pattern Score</h3>
          </div>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            {analytics?.alerts?.length || 0}/3
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Active spending patterns
          </p>
        </Card>
      </div>

      {/* No Alerts Message */}
      {(!analytics?.alerts || analytics.alerts.length === 0) && (
        <Card className="p-12 text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <TrendingUp className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Great Job! 🎉
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No concerning spending patterns detected. Keep up the good work!
          </p>
        </Card>
      )}
    </div>
  );
};

export default BehaviourAlerts;
