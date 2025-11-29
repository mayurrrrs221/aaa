import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FinancialCalendar = ({ currency, formatCurrency }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expenses, setExpenses] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    try {
      const [expensesRes, subsRes] = await Promise.all([
        axios.get(`${API}/expenses`),
        axios.get(`${API}/subscriptions`)
      ]);
      setExpenses(expensesRes.data);
      setSubscriptions(subsRes.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load calendar data');
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getExpensesForDay = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return expenses.filter(e => e.date.startsWith(dateStr));
  };

  const getSubscriptionsForDay = (day) => {
    return subscriptions.filter(sub => {
      const nextBilling = new Date(sub.next_billing_date);
      return nextBilling.getDate() === day && 
             nextBilling.getMonth() === currentDate.getMonth() &&
             nextBilling.getFullYear() === currentDate.getFullYear();
    });
  };

  const getDayTotal = (day) => {
    const dayExpenses = getExpensesForDay(day);
    return dayExpenses.reduce((sum, e) => sum + e.amount, 0);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="calendar-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text">Financial Calendar</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">View your spending and dues by date</p>
      </div>

      <div className="glass-effect rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <Button 
            data-testid="prev-month"
            onClick={previousMonth}
            variant="ghost"
            size="icon"
          >
            <ChevronLeft size={24} />
          </Button>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{monthName}</h2>
          <Button 
            data-testid="next-month"
            onClick={nextMonth}
            variant="ghost"
            size="icon"
          >
            <ChevronRight size={24} />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => (
            <div key={day} className="text-center font-bold text-gray-600 dark:text-gray-400 p-2">
              {day}
            </div>
          ))}
          
          {[...Array(startingDayOfWeek)].map((_, i) => (
            <div key={`empty-${i}`} className="p-2"></div>
          ))}
          
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const dayExpenses = getExpensesForDay(day);
            const daySubs = getSubscriptionsForDay(day);
            const total = getDayTotal(day);
            const today = new Date();
            const isToday = day === today.getDate() && 
                           currentDate.getMonth() === today.getMonth() &&
                           currentDate.getFullYear() === today.getFullYear();
            
            return (
              <div 
                key={day}
                data-testid={`calendar-day-${day}`}
                className={`min-h-[100px] p-2 rounded-lg border transition-all ${
                  isToday 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                } hover:shadow-md`}
              >
                <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{day}</div>
                {total > 0 && (
                  <div className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">
                    {formatCurrency(total)}
                  </div>
                )}
                {dayExpenses.length > 0 && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {dayExpenses.length} expense{dayExpenses.length > 1 ? 's' : ''}
                  </div>
                )}
                {daySubs.length > 0 && (
                  <div className="mt-1">
                    {daySubs.map(sub => (
                      <div key={sub.id} className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded px-1 py-0.5 mb-1">
                        {sub.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FinancialCalendar;