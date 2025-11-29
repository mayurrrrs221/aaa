import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Lightbulb, TrendingDown, DollarSign, Target, RefreshCw } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LifestyleRecommendations = ({ currency, formatCurrency }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/recommendations`);
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'from-red-400 to-red-600';
      case 'medium':
        return 'from-yellow-400 to-yellow-600';
      case 'low':
        return 'from-blue-400 to-blue-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    };
    return colors[priority] || colors.low;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6" data-testid="lifestyle-recommendations">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Lifestyle Recommendations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Smart suggestions to optimize your spending
          </p>
        </div>
        <Button 
          onClick={fetchRecommendations} 
          data-testid="refresh-recommendations-btn"
          className="bg-gradient-to-r from-blue-500 to-purple-600"
        >
          <RefreshCw className="mr-2" size={18} />
          Refresh
        </Button>
      </div>

      {recommendations.length === 0 ? (
        <Card className="p-12 text-center">
          <Lightbulb className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            No Recommendations Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Keep tracking your expenses to get personalized recommendations!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recommendations.map((rec, index) => (
            <Card 
              key={index} 
              className="p-6 hover:shadow-xl transition-all duration-300"
              data-testid={`recommendation-${index}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-xl bg-gradient-to-br ${getPriorityColor(rec.priority)} shadow-lg flex-shrink-0`}>
                  <Lightbulb className="text-white" size={28} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {rec.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(rec.priority)}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {rec.description}
                  </p>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Target className="text-purple-600 dark:text-purple-400" size={20} />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{rec.category}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DollarSign className="text-green-600 dark:text-green-400" size={20} />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Potential Savings</p>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(rec.potential_savings)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Card */}
      {recommendations.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-500 rounded-full">
              <TrendingDown className="text-white" size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Total Potential Savings
              </h3>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">
                {formatCurrency(
                  recommendations.reduce((sum, rec) => sum + rec.potential_savings, 0)
                )}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                per month if you follow these recommendations
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default LifestyleRecommendations;
