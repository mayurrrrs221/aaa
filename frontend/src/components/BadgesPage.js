import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Award, Trophy, Star, Target, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BadgesPage = () => {
  const { t } = useTranslation();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await axios.get(`${API}/badges`);
      setBadges(response.data.badges || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching badges:', error);
      toast.error('Failed to load badges');
      setLoading(false);
    }
  };

  const checkNewBadges = async () => {
    setChecking(true);
    try {
      const response = await axios.post(`${API}/badges/check`);
      
      if (response.data.new_badges && response.data.new_badges.length > 0) {
        toast.success(`🎉 Earned ${response.data.new_badges.length} new badge(s)!`);
        fetchBadges();
      } else {
        toast.info('No new badges yet. Keep going!');
      }
    } catch (error) {
      toast.error('Failed to check badges');
    } finally {
      setChecking(false);
    }
  };

  const getBadgeIcon = (icon) => {
    const iconMap = {
      '🎯': Target,
      '💰': Trophy,
      '🧠': Star,
      '👑': Award,
      '⭐': TrendingUp
    };
    
    const IconComponent = iconMap[icon] || Award;
    return <IconComponent className="h-12 w-12" />;
  };

  const getBadgeColor = (index) => {
    const colors = [
      'from-yellow-400 to-yellow-600',
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-red-400 to-red-600'
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6" data-testid="badges-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold gradient-text">{t('badgesAndMilestones')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('earnedBadges')}: {badges.length}
          </p>
        </div>
        <Button 
          data-testid="check-badges-btn"
          onClick={checkNewBadges} 
          disabled={checking}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Award className="mr-2" size={18} />
          {checking ? 'Checking...' : 'Check for New Badges'}
        </Button>
      </div>

      {badges.length === 0 ? (
        <div className="text-center py-20">
          <Award className="mx-auto h-20 w-20 text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('noBadgesYet')}
          </h3>
          <p className="mt-2 text-gray-500">Start tracking expenses to earn badges!</p>
          <Button onClick={checkNewBadges} className="mt-6">
            Check Eligibility
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge, index) => (
            <Card 
              key={badge.id} 
              className="p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              data-testid={`badge-${index}`}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-6 rounded-full bg-gradient-to-br ${getBadgeColor(index)} shadow-lg`}>
                  <div className="text-white text-4xl">{badge.icon}</div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {badge.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {badge.description}
                  </p>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Earned: {new Date(badge.earned_date).toLocaleDateString()}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Badge Progress Section */}
      <Card className="p-6 mt-8">
        <h3 className="text-xl font-bold mb-4">Badge Progress</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">Total Badges Earned</p>
              <p className="text-sm text-gray-500">Keep tracking to unlock more!</p>
            </div>
            <div className="text-3xl font-bold text-purple-600">{badges.length}</div>
          </div>
          
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
              style={{ width: `${Math.min((badges.length / 10) * 100, 100)}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-500 text-center">
            {10 - badges.length > 0 
              ? `${10 - badges.length} more badges to reach Level 1` 
              : 'You\'ve reached Level 1! 🎉'}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default BadgesPage;
