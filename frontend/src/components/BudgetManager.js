import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BudgetManager = ({ currency, formatCurrency }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: 'Food',
    monthly_limit: ''
  });

  const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Healthcare', 'Bills', 'Other'];

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await axios.get(`${API}/budgets`);
      setBudgets(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load budgets');
      setLoading(false);
    }
  };

  const handleAddBudget = async () => {
    if (!newBudget.monthly_limit) {
      toast.error('Please enter a budget limit');
      return;
    }

    try {
      await axios.post(`${API}/budgets`, {
        ...newBudget,
        monthly_limit: parseFloat(newBudget.monthly_limit),
        currency
      });
      toast.success('Budget limit set!');
      fetchBudgets();
      setNewBudget({ category: 'Food', monthly_limit: '' });
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to set budget');
    }
  };

  const getBudgetStatus = (budget) => {
    const percentage = (budget.current_spent / budget.monthly_limit) * 100;
    if (percentage >= 100) return { color: 'red', icon: AlertTriangle, message: 'Exceeded!' };
    if (percentage >= 80) return { color: 'orange', icon: AlertTriangle, message: 'Warning!' };
    return { color: 'green', icon: CheckCircle, message: 'On Track' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="budget-manager-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Budget Manager</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Set and track category spending limits</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-budget-btn" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg">
              <Plus className="mr-2" size={18} />
              Set Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Category Budget</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select 
                value={newBudget.category} 
                onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}
              >
                <SelectTrigger data-testid="budget-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                data-testid="budget-limit"
                type="number"
                placeholder="Monthly Limit"
                value={newBudget.monthly_limit}
                onChange={(e) => setNewBudget({ ...newBudget, monthly_limit: e.target.value })}
              />
              <Button 
                data-testid="submit-budget"
                onClick={handleAddBudget} 
                className="w-full bg-green-500 hover:bg-green-600"
              >
                Set Budget
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.length === 0 ? (
          <div className="col-span-3 glass-effect rounded-2xl p-12 shadow-lg text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No budgets set yet. Start by adding a budget limit!</p>
          </div>
        ) : (
          budgets.map((budget) => {
            const percentage = (budget.current_spent / budget.monthly_limit) * 100;
            const status = getBudgetStatus(budget);
            const StatusIcon = status.icon;
            
            return (
              <div 
                key={budget.id} 
                data-testid={`budget-item-${budget.category}`}
                className={`glass-effect rounded-2xl p-6 shadow-lg card-hover ${
                  status.color === 'red' ? 'border-2 border-red-500' :
                  status.color === 'orange' ? 'border-2 border-orange-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{budget.category}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This Month</p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    status.color === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                    status.color === 'orange' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                    'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  }`}>
                    <StatusIcon size={14} />
                    <span className="text-xs font-medium">{status.message}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Spent</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={percentage} className="h-3" />
                  <div className="flex justify-between pt-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Spent</p>
                      <p className={`text-lg font-bold ${
                        status.color === 'red' ? 'text-red-600 dark:text-red-400' :
                        status.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                        'text-blue-600 dark:text-blue-400'
                      }`}>
                        {formatCurrency(budget.current_spent)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Limit</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {formatCurrency(budget.monthly_limit)}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(Math.max(0, budget.monthly_limit - budget.current_spent))}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BudgetManager;