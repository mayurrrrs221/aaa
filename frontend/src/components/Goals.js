import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Target } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Progress } from './ui/progress';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Goals = ({ currency, formatCurrency }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [calculations, setCalculations] = useState(null);
  const [newGoal, setNewGoal] = useState({
    name: '',
    target_amount: '',
    target_date: '',
    current_amount: 0
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${API}/goals`);
      setGoals(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load goals');
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.name || !newGoal.target_amount || !newGoal.target_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await axios.post(`${API}/goals`, {
        ...newGoal,
        target_amount: parseFloat(newGoal.target_amount),
        current_amount: parseFloat(newGoal.current_amount || 0),
        currency
      });
      toast.success('Goal added!');
      fetchGoals();
      setNewGoal({ name: '', target_amount: '', target_date: '', current_amount: 0 });
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add goal');
    }
  };

  const fetchCalculations = async (goalId) => {
    try {
      const response = await axios.get(`${API}/goals/${goalId}/calculations`);
      setCalculations(response.data);
      setSelectedGoal(goalId);
    } catch (error) {
      toast.error('Failed to calculate goal details');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="goals-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Goals</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track your savings goals</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-goal-btn" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg">
              <Plus className="mr-2" size={18} />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                data-testid="goal-name"
                placeholder="Goal Name (e.g., Vacation Fund)"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              />
              <Input
                data-testid="goal-target-amount"
                type="number"
                placeholder="Target Amount"
                value={newGoal.target_amount}
                onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
              />
              <Input
                data-testid="goal-current-amount"
                type="number"
                placeholder="Current Amount (optional)"
                value={newGoal.current_amount}
                onChange={(e) => setNewGoal({ ...newGoal, current_amount: e.target.value })}
              />
              <Input
                data-testid="goal-target-date"
                type="date"
                value={newGoal.target_date}
                onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
              />
              <Button 
                data-testid="submit-goal"
                onClick={handleAddGoal} 
                className="w-full bg-green-500 hover:bg-green-600"
              >
                Add Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.length === 0 ? (
          <div className="col-span-2 glass-effect rounded-2xl p-12 shadow-lg text-center">
            <Target size={64} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No goals yet. Start by adding your first savings goal!</p>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            const isCompleted = progress >= 100;
            
            return (
              <div 
                key={goal.id} 
                data-testid={`goal-item-${goal.id}`}
                className="glass-effect rounded-2xl p-6 shadow-lg card-hover"
                onClick={() => fetchCalculations(goal.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{goal.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Target: {new Date(goal.target_date).toLocaleDateString()}
                    </p>
                  </div>
                  {isCompleted && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs rounded-full font-medium">
                      Completed!
                    </span>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between pt-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Current</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(goal.current_amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Target</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(goal.target_amount)}
                      </p>
                    </div>
                  </div>
                </div>
                
                {selectedGoal === goal.id && calculations && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Smart Calculations</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Days Remaining</p>
                        <p className="font-bold text-blue-600 dark:text-blue-400">{calculations.days_remaining}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Daily Savings</p>
                        <p className="font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(calculations.daily_savings_needed)}
                        </p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg col-span-2">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Monthly Savings Needed</p>
                        <p className="font-bold text-purple-600 dark:text-purple-400">
                          {formatCurrency(calculations.monthly_savings_needed)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Goals;