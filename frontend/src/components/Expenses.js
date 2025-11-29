import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Expenses = ({ currency, convertCurrency, formatCurrency }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'Food',
    description: '',
    merchant: '',
    is_regret: false
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Healthcare', 'Bills', 'Other'];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API}/expenses`);
      setExpenses(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load expenses');
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.amount || !newExpense.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await axios.post(`${API}/expenses`, {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        currency
      });
      toast.success('Expense added successfully!');
      fetchExpenses();
      setNewExpense({ amount: '', category: 'Food', description: '', merchant: '', is_regret: false });
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await axios.delete(`${API}/expenses/${id}`);
      toast.success('Expense deleted');
      fetchExpenses();
    } catch (error) {
      toast.error('Failed to delete expense');
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
    <div className="p-8" data-testid="expenses-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Expenses</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track your spending</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-expense-btn" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg">
              <Plus className="mr-2" size={18} />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                data-testid="expense-amount"
                type="number"
                placeholder="Amount"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              />
              <Select 
                value={newExpense.category} 
                onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
              >
                <SelectTrigger data-testid="expense-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                data-testid="expense-description"
                placeholder="Description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />
              <Input
                data-testid="expense-merchant"
                placeholder="Merchant (optional)"
                value={newExpense.merchant}
                onChange={(e) => setNewExpense({ ...newExpense, merchant: e.target.value })}
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  data-testid="expense-regret"
                  checked={newExpense.is_regret}
                  onCheckedChange={(checked) => setNewExpense({ ...newExpense, is_regret: checked })}
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">Mark as regret purchase</label>
              </div>
              <Button 
                data-testid="submit-expense"
                onClick={handleAddExpense} 
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                Add Expense
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-effect rounded-2xl p-6 shadow-lg">
        <div className="space-y-4">
          {expenses.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No expenses yet. Add your first expense!</p>
          ) : (
            expenses.map((expense) => (
              <div 
                key={expense.id} 
                data-testid={`expense-item-${expense.id}`}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      expense.category === 'Food' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      expense.category === 'Transport' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                      expense.category === 'Shopping' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {expense.category}
                    </div>
                    {expense.is_regret && (
                      <span className="px-2 py-1 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 text-xs rounded-full font-medium">
                        Regret
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mt-2">{expense.description}</p>
                  {expense.merchant && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">at {expense.merchant}</p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {formatCurrency(convertCurrency(expense.amount, expense.currency))}
                  </p>
                  <Button
                    data-testid={`delete-expense-${expense.id}`}
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Expenses;