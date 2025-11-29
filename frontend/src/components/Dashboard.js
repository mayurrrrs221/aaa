import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Mic, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

const Dashboard = ({ currency, convertCurrency, formatCurrency }) => {
  const [expenses, setExpenses] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [analytics, setAnalytics] = useState({
    income: 0,
    expenses: 0,
    savings: 0,
    categories: [],
    topExpenses: []
  });
  const [trends, setTrends] = useState([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const loadedSubscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
    const loadedGoals = JSON.parse(localStorage.getItem('goals') || '[]');
    
    setExpenses(loadedExpenses);
    setSubscriptions(loadedSubscriptions);
    setGoals(loadedGoals);
  }, []);

  // Calculate analytics when data changes
  useEffect(() => {
    calculateAnalytics();
  }, [expenses, subscriptions, goals]);

  const calculateAnalytics = () => {
    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    
    // Calculate total monthly subscriptions
    const totalMonthlySubscriptions = subscriptions
      .filter(sub => sub.billing_cycle === 'monthly')
      .reduce((sum, sub) => sum + (sub.amount || 0), 0);
    
    // Calculate total yearly subscriptions (convert to monthly)
    const totalYearlySubscriptions = subscriptions
      .filter(sub => sub.billing_cycle === 'yearly')
      .reduce((sum, sub) => sum + ((sub.amount || 0) / 12), 0);
    
    const totalSubscriptions = totalMonthlySubscriptions + totalYearlySubscriptions;
    
    // Assume some income (users can add goals/budgets to represent income targets)
    const totalGoalTargets = goals.reduce((sum, goal) => sum + (goal.targetAmount || 0), 0);
    const estimatedIncome = totalExpenses + totalSubscriptions + totalGoalTargets + 5000; // Base income estimate
    const totalExpensesAndSubs = totalExpenses + totalSubscriptions;
    const savings = Math.max(0, estimatedIncome - totalExpensesAndSubs);

    // Calculate categories
    const categoryMap = {};
    expenses.forEach(expense => {
      const category = expense.category || 'Other';
      categoryMap[category] = (categoryMap[category] || 0) + (expense.amount || 0);
    });
    
    const categories = Object.keys(categoryMap).map(name => ({
      name,
      value: categoryMap[name]
    }));

    // Get top 3 expenses
    const topExpenses = [...expenses]
      .sort((a, b) => (b.amount || 0) - (a.amount || 0))
      .slice(0, 3);

    // Calculate trends (last 7 days)
    const trendsData = generateTrends(expenses);

    setAnalytics({
      income: estimatedIncome,
      expenses: totalExpensesAndSubs,
      savings,
      categories,
      topExpenses
    });
    setTrends(trendsData);
  };

  const generateTrends = (expensesList) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => {
      const dayAmount = expensesList
        .filter(exp => exp.day === day)
        .reduce((sum, exp) => sum + (exp.amount || 0), 0);
      return { day, amount: dayAmount || 0 };
    });
  };

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="p-8" data-testid="dashboard-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Your financial overview</p>
        </div>
        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg gap-2">
                <Mic size={18} />
                Voice Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Voice Expense</DialogTitle>
              </DialogHeader>
              <p className="text-gray-600">Coming soon!</p>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg gap-2">
                <Camera size={18} />
                Scan Receipt
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Scan Receipt</DialogTitle>
              </DialogHeader>
              <p className="text-gray-600">Coming soon!</p>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Income</p>
              <p className="text-4xl font-bold mt-2 text-green-600">{formatCurrency(analytics.income)}</p>
            </div>
            <div className="p-4 bg-green-100 dark:bg-green-900 rounded-xl">
              <Wallet className="text-green-600" size={28} />
            </div>
          </div>
        </div>
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Expenses</p>
              <p className="text-4xl font-bold mt-2 text-red-600">{formatCurrency(analytics.expenses)}</p>
            </div>
            <div className="p-4 bg-red-100 dark:bg-red-900 rounded-xl">
              <TrendingDown className="text-red-600" size={28} />
            </div>
          </div>
        </div>
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Savings</p>
              <p className="text-4xl font-bold mt-2 text-blue-600">{formatCurrency(analytics.savings)}</p>
            </div>
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <DollarSign className="text-blue-600" size={28} />
            </div>
          </div>
        </div>
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Savings Rate</p>
              <p className="text-4xl font-bold mt-2 text-purple-600">{((analytics.savings / analytics.income) * 100 || 0).toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-xl">
              <TrendingUp className="text-purple-600" size={28} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 glass-effect rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Spending Trends (Weekly)</h2>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No spending data yet. Add expenses to see trends.</p>
          )}
        </div>
        {analytics.categories && analytics.categories.length > 0 && (
          <div className="glass-effect rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Expense Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={analytics.categories} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                  {analytics.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {analytics.topExpenses && analytics.topExpenses.length > 0 && (
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Top Expenses</h2>
          <div className="space-y-3">
            {analytics.topExpenses.map((expense, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{expense.category}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{expense.description}</p>
                </div>
                <p className="text-xl font-bold text-red-600">{formatCurrency(expense.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {(!analytics.topExpenses || analytics.topExpenses.length === 0) && (
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <p className="text-gray-500 text-center">No expenses yet. Go to the Expenses tab to add your first expense!</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
