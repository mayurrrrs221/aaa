import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Sparkles, Brain, Heart, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AIFeatures = () => {
  const { t } = useTranslation();
  const [story, setStory] = useState('');
  const [habitAnalysis, setHabitAnalysis] = useState('');
  const [emotionalAnalysis, setEmotionalAnalysis] = useState('');
  const [loadingStory, setLoadingStory] = useState(false);
  const [loadingHabit, setLoadingHabit] = useState(false);
  const [loadingEmotional, setLoadingEmotional] = useState(false);

  const generateStory = async () => {
    setLoadingStory(true);
    try {
      const response = await axios.post(`${API}/ai/financial-story`);
      setStory(response.data.story);
      toast.success('Financial story generated!');
    } catch (error) {
      console.error('Error generating story:', error);
      toast.error('Failed to generate story');
    } finally {
      setLoadingStory(false);
    }
  };

  const analyzeHabits = async () => {
    setLoadingHabit(true);
    try {
      const response = await axios.post(`${API}/ai/habit-correction`);
      setHabitAnalysis(response.data.analysis);
      toast.success('Habit analysis complete!');
    } catch (error) {
      console.error('Error analyzing habits:', error);
      toast.error('Failed to analyze habits');
    } finally {
      setLoadingHabit(false);
    }
  };

  const analyzeEmotionalSpending = async () => {
    setLoadingEmotional(true);
    try {
      const response = await axios.post(`${API}/ai/emotional-spending`);
      setEmotionalAnalysis(response.data.prediction);
      toast.success('Emotional spending analysis complete!');
    } catch (error) {
      console.error('Error analyzing emotional spending:', error);
      toast.error('Failed to analyze emotional spending');
    } finally {
      setLoadingEmotional(false);
    }
  };

  return (
    <div className="p-8 space-y-8" data-testid="ai-features-page">
      <div>
        <h1 className="text-4xl font-bold gradient-text">AI-Powered Features</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Advanced AI insights into your financial behavior
        </p>
      </div>

      {/* Financial Story Generator */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600">
            <BookOpen className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t('financialStory')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get a creative narrative of your financial journey
            </p>
          </div>
        </div>
        
        <Button 
          data-testid="generate-story-btn"
          onClick={generateStory} 
          disabled={loadingStory}
          className="mb-4 bg-purple-500 hover:bg-purple-600"
        >
          <Sparkles className="mr-2" size={18} />
          {loadingStory ? 'Generating...' : t('generateStory')}
        </Button>
        
        {story && (
          <div className="mt-4 p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{story}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Habit Correction Engine */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600">
            <Brain className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t('habitCorrection')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Neural habit correction engine - identify money-draining patterns
            </p>
          </div>
        </div>
        
        <Button 
          data-testid="analyze-habits-btn"
          onClick={analyzeHabits} 
          disabled={loadingHabit}
          className="mb-4 bg-blue-500 hover:bg-blue-600"
        >
          <Brain className="mr-2" size={18} />
          {loadingHabit ? 'Analyzing...' : t('analyzeHabits')}
        </Button>
        
        {habitAnalysis && (
          <div className="mt-4 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{habitAnalysis}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Emotional Spending Predictor */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600">
            <Heart className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t('emotionalSpending')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Predict emotional spending patterns and triggers
            </p>
          </div>
        </div>
        
        <Button 
          data-testid="analyze-emotional-btn"
          onClick={analyzeEmotionalSpending} 
          disabled={loadingEmotional}
          className="mb-4 bg-pink-500 hover:bg-pink-600"
        >
          <Heart className="mr-2" size={18} />
          {loadingEmotional ? 'Analyzing...' : t('predictEmotions')}
        </Button>
        
        {emotionalAnalysis && (
          <div className="mt-4 p-6 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg">
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{emotionalAnalysis}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
        <div className="flex items-start gap-3">
          <Sparkles className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">About AI Features</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              These AI-powered features use advanced language models to analyze your financial data 
              and provide personalized insights. The more data you have, the better the insights!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIFeatures;
