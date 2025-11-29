import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TrendingUp, TrendingDown, Target, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CategoryInsights = ({ currency, formatCurrency }) => {
  const [category, setCategory] = useState('Food');
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    'Food',
    'Transport',
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Bills',
    'Other'
  ];

  const fetchCategoryInsights = async (selectedCategory) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/analytics/category/${selectedCategory}`);
      if (response.data.message) {
        toast.info(response.data.message);
        setInsights(null);
      } else {
        setInsights(response.data);
      }
    } catch (error) {
      console.error('Error fetching category insights:', error);
      toast.error('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    fetchCategoryInsights(value);
  };

  useState(() => {
    fetchCategoryInsights(category);
  }, []);

  if (loading && !insights) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6" data-testid="category-insights">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Category Insights</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Deep dive into your spending by category
          </p>
        </div>
      </div>

      {/* Category Selector */}
      <Card className="p-6">
        <label className="block text-sm font-medium mb-3">Select Category</label>
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger data-testid="category-selector" className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {insights ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Target className="text-blue-500" size={24} />
                <h3 className="font-bold text-gray-900 dark:text-gray-100">Total Spent</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(insights.total_spent)}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="text-purple-500" size={24} />
                <h3 className="font-bold text-gray-900 dark:text-gray-100">Transactions</h3>
              </div>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {insights.total_transactions}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-green-500" size={24} />
                <h3 className="font-bold text-gray-900 dark:text-gray-100">Avg/Month</h3>
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(insights.average_per_month)}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Target className="text-orange-500" size={24} />
                <h3 className="font-bold text-gray-900 dark:text-gray-100">Avg/Transaction</h3>
              </div>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(insights.average_per_transaction)}
              </p>
            </Card>
          </div>

          {/* Best and Worst Month */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-500 rounded-full">
                  <TrendingDown className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Best Month</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Lowest spending</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {insights.best_month.month || 'N/A'}
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(insights.best_month.amount)}
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500 rounded-full">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Worst Month</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Highest spending</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {insights.worst_month.month || 'N/A'}
                </p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(insights.worst_month.amount)}
                </p>
              </div>
            </Card>
          </div>

          {/* Monthly Trend Chart */}
          {insights.monthly_trend && insights.monthly_trend.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Monthly Spending Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={insights.monthly_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#0ea5e9" 
                    strokeWidth={3}
                    dot={{ fill: '#0ea5e9', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Suggestion */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
            <div className="flex items-start gap-3">
              <Target className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">💡 Suggestion</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {insights.suggestion}
                </p>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-12 text-center">
          <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            No Data Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No transactions found for this category. Start tracking to see insights!
          </p>
        </Card>
      )}
    </div>
  );
};

export default CategoryInsights;
