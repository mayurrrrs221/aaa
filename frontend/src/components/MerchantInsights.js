import { useState, useEffect } from 'react';
import axios from 'axios';
import { Store, TrendingUp, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MerchantInsights = ({ currency, formatCurrency }) => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMerchantInsights();
  }, []);

  const fetchMerchantInsights = async () => {
    try {
      const response = await axios.get(`${API}/analytics/merchants`);
      setMerchants(response.data.merchants);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load merchant insights');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const chartData = merchants.slice(0, 10).map(m => ({
    name: m.merchant.length > 15 ? m.merchant.substring(0, 15) + '...' : m.merchant,
    amount: m.total_spent,
    count: m.transaction_count
  }));

  const topMerchant = merchants[0] || {};

  return (
    <div className="p-8 space-y-8" data-testid="merchant-insights">
      <div>
        <h1 className="text-4xl font-bold gradient-text">🏪 Merchant Insights</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Where you spend your money</p>
      </div>

      {/* Summary Cards */}
      {merchants.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Merchant</h3>
                <p className="text-2xl font-bold mt-2">{topMerchant.merchant}</p>
              </div>
              <Store className="text-blue-500" size={32} />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</h3>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                  {formatCurrency(topMerchant.total_spent)}
                </p>
              </div>
              <TrendingUp className="text-red-500" size={32} />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Transactions</h3>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {topMerchant.transaction_count}
                </p>
              </div>
              <ShoppingBag className="text-purple-500" size={32} />
            </div>
          </Card>
        </div>
      )}

      {/* Chart */}
      {merchants.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Top Merchants by Spending</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b"
                angle={-45}
                textAnchor="end"
                height={100}
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
              <Legend />
              <Bar dataKey="amount" fill="#0ea5e9" name="Total Spent (₹)" />
              <Bar dataKey="count" fill="#8b5cf6" name="Transactions" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Merchant List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Detailed Breakdown</h2>
        
        {merchants.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No merchant data available yet. Add expenses to see insights!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {merchants.map((merchant, idx) => (
              <Card key={idx} className="p-6" data-testid={`merchant-card-${idx}`}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold">{merchant.merchant}</h3>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs">
                    #{idx + 1}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Spent:</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(merchant.total_spent)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Transactions:</span>
                    <span className="font-semibold">{merchant.transaction_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Avg per order:</span>
                    <span className="font-semibold">
                      {formatCurrency(merchant.average_transaction)}
                    </span>
                  </div>
                </div>
                
                {merchant.total_spent > 5000 && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      💡 High spending detected! Consider reducing orders.
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantInsights;
