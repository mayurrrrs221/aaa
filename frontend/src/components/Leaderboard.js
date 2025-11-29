import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Medal, Award } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API}/leaderboard`);
      setLeaderboard(response.data.leaderboard);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load leaderboard');
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="text-yellow-500" size={24} />;
    if (rank === 2) return <Medal className="text-gray-400" size={24} />;
    if (rank === 3) return <Medal className="text-orange-600" size={24} />;
    return <Award className="text-blue-500" size={20} />;
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600';
    return 'bg-gradient-to-r from-blue-400 to-blue-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="leaderboard-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text">Leaderboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Top savers this month</p>
      </div>

      <div className="glass-effect rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <h2 className="text-2xl font-bold text-white">Savings Champions</h2>
          <p className="text-blue-100 mt-1">Compete with others and improve your savings!</p>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {leaderboard.map((user, idx) => {
              const isCurrentUser = user.user_id === 'default_user';
              
              return (
                <div
                  key={user.user_id}
                  data-testid={`leaderboard-item-${idx}`}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    isCurrentUser
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-300 dark:border-blue-700 shadow-md'
                      : 'bg-white dark:bg-gray-800 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-12 h-12 rounded-full ${getRankBadge(user.rank)} flex items-center justify-center shadow-lg`}>
                      {getRankIcon(user.rank)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800 dark:text-gray-200">
                          {isCurrentUser ? 'You' : `User ${user.user_id.split('_')[1] || user.user_id}`}
                        </p>
                        {isCurrentUser && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Rank #{user.rank}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {user.savings_percentage.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Savings Rate</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 glass-effect rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">How Rankings Work</h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>Rankings are based on your savings percentage (savings / income)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>Updated weekly based on your financial activity</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>Compete with other users to stay motivated!</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Leaderboard;