import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Repeat, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RecurringTransactions = ({ currency, formatCurrency }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    name: '',
    amount: '',
    category: 'Bills',
    transaction_type: 'expense',
    recurring_date: '1'
  });

  const categories = ['Bills', 'Subscriptions', 'Rent', 'Salary', 'Investment', 'Other'];

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API}/recurring-transactions`);
      setTransactions(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load recurring transactions');
      setLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.name || !newTransaction.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await axios.post(`${API}/recurring-transactions`, {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
        recurring_date: parseInt(newTransaction.recurring_date),
        currency
      });
      toast.success('Recurring transaction added!');
      fetchTransactions();
      setNewTransaction({ name: '', amount: '', category: 'Bills', transaction_type: 'expense', recurring_date: '1' });
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add transaction');
    }
  };

  const processRecurring = async () => {
    try {
      const response = await axios.post(`${API}/recurring-transactions/process`);
      if (response.data.count > 0) {
        toast.success(`Processed ${response.data.count} recurring transactions!`);
      } else {
        toast.info('No transactions due today');
      }
    } catch (error) {
      toast.error('Failed to process recurring transactions');
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
    <div className="p-8" data-testid="recurring-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Recurring Transactions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Auto-add monthly bills and income</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            data-testid="process-recurring-btn"
            onClick={processRecurring}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
          >
            <Repeat className="mr-2" size={18} />
            Process Now
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-recurring-btn" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg">
                <Plus className="mr-2" size={18} />
                Add Recurring
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Recurring Transaction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  data-testid="recurring-name"
                  placeholder="Name (e.g., Netflix, Rent)"
                  value={newTransaction.name}
                  onChange={(e) => setNewTransaction({ ...newTransaction, name: e.target.value })}
                />
                <Input
                  data-testid="recurring-amount"
                  type="number"
                  placeholder="Amount"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                />
                <Select 
                  value={newTransaction.transaction_type} 
                  onValueChange={(value) => setNewTransaction({ ...newTransaction, transaction_type: value })}
                >
                  <SelectTrigger data-testid="recurring-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={newTransaction.category} 
                  onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}
                >
                  <SelectTrigger data-testid="recurring-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  data-testid="recurring-date"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Day of Month (1-31)"
                  value={newTransaction.recurring_date}
                  onChange={(e) => setNewTransaction({ ...newTransaction, recurring_date: e.target.value })}
                />
                <Button 
                  data-testid="submit-recurring"
                  onClick={handleAddTransaction} 
                  className="w-full bg-purple-500 hover:bg-purple-600"
                >
                  Add Transaction
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="glass-effect rounded-2xl p-6 shadow-lg">
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No recurring transactions yet. Add your first one!</p>
          ) : (
            transactions.map((transaction) => (
              <div 
                key={transaction.id} 
                data-testid={`recurring-item-${transaction.id}`}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{transaction.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      transaction.transaction_type === 'income' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {transaction.transaction_type}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs rounded-full">
                      {transaction.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Repeats on day {transaction.recurring_date} of every month
                  </p>
                  {transaction.last_processed && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Last processed: {new Date(transaction.last_processed).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RecurringTransactions;