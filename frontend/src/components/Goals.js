import { useState } from 'react';
import { Plus, Trash2, Target } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';

const Goals = ({ currency, formatCurrency }) => {
  const [goals] = useState([
    { id: 1, title: 'Emergency Fund', target_amount: 100000, current_amount: 45000, category: 'Savings', target_date: '2024-12-31' },
    { id: 2, title: 'Vacation Fund', target_amount: 50000, current_amount: 15000, category: 'Travel', target_date: '2024-06-30' },
    { id: 3, title: 'New Laptop', target_amount: 100000, current_amount: 60000, category: 'Electronics', target_date: '2024-05-31' }
  ]);
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    target_amount: '',
    current_amount: 0,
    category: 'Savings',
    target_date: ''
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.target_amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success('Goal created successfully!');
    setNewGoal({ title: '', target_amount: '', current_amount: 0, category: 'Savings', target_date: '' });
    setDialogOpen(false);
  };

  const handleDeleteGoal = (id) => {
    toast.success('Goal deleted');
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const totalTarget = goals.reduce((sum, goal) => sum + (goal.target_amount || 0), 0);
  const totalSaved = goals.reduce((sum, goal) => sum + (goal.current_amount || 0), 0);

  return (
    <div className="p-8" data-testid="goals-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Financial Goals</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Set and track your financial objectives</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg">
              <Plus className="mr-2" size={18} />
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Financial Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                data-testid="goal-title"
                placeholder="Goal Title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              />
              <Input
                data-testid="goal-target"
                type="number"
                placeholder="Target Amount"
                value={newGoal.target_amount}
                onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
              />
              <Input
                data-testid="goal-current"
                type="number"
                placeholder="Current Amount"
                value={newGoal.current_amount}
                onChange={(e) => setNewGoal({ ...newGoal, current_amount: e.target.value })}
              />
              <Input
                data-testid="goal-date"
                type="date"
                value={newGoal.target_date}
                onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
              />
              <Button 
                data-testid="submit-goal"
                onClick={handleAddGoal} 
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Total Goals</p>
          <p className="text-4xl font-bold mt-2 text-blue-600">{goals.length}</p>
        </div>
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Total Target</p>
          <p className="text-4xl font-bold mt-2 text-green-600">
            {formatCurrency(totalTarget)}
          </p>
        </div>
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Total Saved</p>
          <p className="text-4xl font-bold mt-2 text-purple-600">
            {formatCurrency(totalSaved)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="glass-effect rounded-2xl p-12 shadow-lg text-center">
            <Target className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No goals yet. Create your first financial goal!</p>
          </div>
        ) : (
          goals.map((goal) => {
            const percentage = getProgressPercentage(goal.current_amount, goal.target_amount);
            return (
              <div 
                key={goal.id} 
                data-testid={`goal-item-${goal.id}`}
                className="glass-effect rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{goal.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Target Date: {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <Button
                    data-testid={`delete-goal-${goal.id}`}
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                  >
                    <Trash2 size={20} />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(goal.current_amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Target</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(goal.target_amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Progress</p>
                    <p className="text-2xl font-bold text-purple-600">{percentage.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Goals;
