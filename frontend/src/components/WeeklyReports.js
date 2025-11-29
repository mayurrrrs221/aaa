import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Calendar, Download, Mail, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WeeklyReports = ({ currency, formatCurrency }) => {
  const { t } = useTranslation();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const fetchWeeklyReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/reports/weekly`);
      setReport(response.data);
      toast.success('Weekly report generated!');
    } catch (error) {
      console.error('Error fetching weekly report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailReport = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }
    
    setSendingEmail(true);
    try {
      await axios.post(`${API}/reports/weekly/email`, { email });
      toast.success(`Report sent to ${email}`);
      setEmail('');
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  useEffect(() => {
    fetchWeeklyReport();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-8">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">No report yet</h3>
          <p className="mt-1 text-sm text-gray-500">Generate your first weekly report</p>
          <Button onClick={fetchWeeklyReport} className="mt-4">
            Generate Report
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6" data-testid="weekly-reports">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold gradient-text">{t('weeklyReport')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {report.week_start} to {report.week_end}
          </p>
        </div>
        <Button onClick={fetchWeeklyReport} data-testid="refresh-report-btn">
          <Download className="mr-2" size={18} />
          Refresh Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Spending</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                {formatCurrency(report.total_spending)}
              </p>
            </div>
            <TrendingDown className="h-12 w-12 text-red-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {formatCurrency(report.total_income)}
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Savings</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {formatCurrency(report.savings)}
              </p>
            </div>
            <Target className="h-12 w-12 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Week Highlights</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Transactions</span>
              <span className="font-bold">{report.transaction_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Top Category</span>
              <span className="font-bold">{report.top_category?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Top Category Spend</span>
              <span className="font-bold text-orange-600">
                {formatCurrency(report.top_category?.amount || 0)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Biggest Purchase</h3>
          {report.biggest_purchase ? (
            <div className="space-y-2">
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(report.biggest_purchase.amount)}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {report.biggest_purchase.description}
              </p>
              <p className="text-sm text-gray-500">
                Category: {report.biggest_purchase.category}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No purchases this week</p>
          )}
        </Card>
      </div>

      {/* Next Week Target */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Next Week Target</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Recommended spending limit</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              {formatCurrency(report.next_week_target)}
            </p>
            <p className="text-sm text-gray-500 mt-1">20% less than this week</p>
          </div>
          <Target className="h-16 w-16 text-green-500" />
        </div>
      </Card>

      {/* Email Report */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Email This Report</h3>
        <div className="flex gap-3">
          <Input
            data-testid="email-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Button 
            data-testid="send-email-btn"
            onClick={handleEmailReport} 
            disabled={sendingEmail}
          >
            <Mail className="mr-2" size={18} />
            {sendingEmail ? 'Sending...' : 'Send Email'}
          </Button>
        </div>
      </Card>

      {/* Category Breakdown */}
      {report.category_breakdown && Object.keys(report.category_breakdown).length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(report.category_breakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">{category}</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default WeeklyReports;
