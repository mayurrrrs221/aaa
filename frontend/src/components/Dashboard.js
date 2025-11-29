import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Mic, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = ({ currency, convertCurrency, formatCurrency }) => {
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voiceText, setVoiceText] = useState('');
  const [receiptImage, setReceiptImage] = useState(null);
  const [processingVoice, setProcessingVoice] = useState(false);
  const [processingReceipt, setProcessingReceipt] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [currency]);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, trendsRes] = await Promise.all([
        axios.get(`${API}/analytics/dashboard`),
        axios.get(`${API}/analytics/trends?days=30`)
      ]);
      
      setAnalytics(analyticsRes.data);
      setTrends(trendsRes.data.daily_spending);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleVoiceExpense = async () => {
    if (!voiceText.trim()) {
      toast.error('Please enter expense details');
      return;
    }
    
    setProcessingVoice(true);
    try {
      const response = await axios.post(`${API}/expenses/voice`, {
        voice_text: voiceText
      });
      
      toast.success('Expense added via voice!');
      setVoiceText('');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to process voice expense');
    } finally {
      setProcessingVoice(false);
    }
  };

  const handleReceiptScan = async () => {
    if (!receiptImage) {
      toast.error('Please upload a receipt image');
      return;
    }
    
    setProcessingReceipt(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        
        const response = await axios.post(`${API}/expenses/scan-receipt`, {
          image_base64: base64
        });
        
        toast.success('Receipt scanned successfully!');
        setReceiptImage(null);
        fetchDashboardData();
      };
      reader.readAsDataURL(receiptImage);
    } catch (error) {
      toast.error('Failed to scan receipt');
    } finally {
      setProcessingReceipt(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const categoryData = Object.entries(analytics?.category_breakdown || {}).map(([name, value]) => ({
    name,
    value: convertCurrency(value)
  }));

  const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

  const statsCards = [
    {
      title: 'Total Income',
      value: formatCurrency(convertCurrency(analytics?.total_income || 0)),
      icon: Wallet,
      color: 'from-green-400 to-green-600',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(convertCurrency(analytics?.total_expenses || 0)),
      icon: TrendingDown,
      color: 'from-red-400 to-red-600',
      textColor: 'text-red-600 dark:text-red-400'
    },
    {
      title: 'Total Savings',
      value: formatCurrency(convertCurrency(analytics?.total_savings || 0)),
      icon: DollarSign,
      color: 'from-blue-400 to-blue-600',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Savings Rate',
      value: `${(analytics?.savings_percentage || 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'from-purple-400 to-purple-600',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
  ];

  return (
    <div className="p-8 space-y-8" data-testid="dashboard">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Your financial overview</p>
        </div>
        
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button data-testid="voice-expense-btn" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg">
                <Mic className="mr-2" size={18} />
                Voice Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Expense by Voice</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  data-testid="voice-input"
                  placeholder='Say something like "Add chai 12 rupees" or "Coffee at Starbucks 150"'
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                  rows={4}
                />
                <Button 
                  data-testid="submit-voice-expense"
                  onClick={handleVoiceExpense} 
                  disabled={processingVoice}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  {processingVoice ? 'Processing...' : 'Add Expense'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button data-testid="scan-receipt-btn" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg">
                <Camera className="mr-2" size={18} />
                Scan Receipt
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Scan Receipt</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  data-testid="receipt-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptImage(e.target.files[0])}
                />
                {receiptImage && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Selected: {receiptImage.name}</p>
                )}
                <Button 
                  data-testid="submit-receipt-scan"
                  onClick={handleReceiptScan} 
                  disabled={processingReceipt}
                  className="w-full bg-purple-500 hover:bg-purple-600"
                >
                  {processingReceipt ? 'Scanning...' : 'Scan Receipt'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-effect rounded-2xl p-6 card-hover shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.title}</p>
                  <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200">Spending Trends (30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
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
                dot={{ fill: '#0ea5e9', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200">Category Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">Monthly Subscriptions</h3>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(convertCurrency(analytics?.monthly_subscription_cost || 0))}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Per month</p>
        </div>

        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">Regret Purchases</h3>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(convertCurrency(analytics?.total_regret_amount || 0))}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{analytics?.regret_count || 0} items</p>
        </div>

        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">Average Daily Spend</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(convertCurrency((analytics?.total_expenses || 0) / 30))}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Last 30 days</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;