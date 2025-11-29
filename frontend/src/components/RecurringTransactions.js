import { useState, useEffect } from 'react';
import { Plus, Repeat, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const RecurringTransactions = ({ currency, formatCurrency }) => {
  const [recurring, setRecurring] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    frequency: 'monthly',
    nextDue: '',
    category: 'Bills'
  });

  const frequencies = ['weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly'];
  const categories = ['Bills', 'Subscriptions', 'Salary', 'Rent', 'Insurance', 'Maintenance', 'Other'];

  // Load data from localStorage on mount
  useEffect(() => {
    const loaded = JSON.parse(localStorage.getItem('recurring') || '[]');
    setRecurring(loaded);
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('recurring', JSON.stringify(recurring));
  }, [recurring]);

  const handleAddTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.nextDue) {
      toast.error('Please fill in all required fields');
      return;
    }

    const transaction = {
      id: Date.now(),
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      frequency: newTransaction.frequency,
      nextDue: newTransaction.nextDue,
      category: newTransaction.category,
      createdAt: new Date().toISOString()
    };

    setRecurring([...recurring, transaction]);
    toast.success('Recurring transaction added!');
    setNewTransaction({ description: '', amount: '', frequency: 'monthly', nextDue: '', category: 'Bills' });
    setDialogOpen(false);
  };

  const handleDeleteTransaction = (id) => {
    setRecurring(recurring.filter(t => t.id !== id));
    toast.success('Recurring transaction deleted');
  };

  const getNextOccurrence = (frequency, baseDate) => {
    const date = new Date(baseDate);
    switch(frequency) {
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'bi-weekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        return baseDate;
    }
    return date.toISOString().split('T')[0];
  };

  const totalMonthly = recurring
    .filter(t => ['weekly', 'monthly', 'bi-weekly'].includes(t.frequency))
    .reduce((sum, t) => {
      const multiplier = t.frequency === 'weekly' ? 4.33 : t.frequency === 'bi-weekly' ? 2.17 : 1;
      return sum + (t.amount * multiplier);
    }, 0);

  const totalYearly = totalMonthly * 12;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Recurring Transactions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your recurring payments and income</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg">
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
                placeholder="Description (e.g., Netflix Subscription)"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Amount"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              />
              <Select value={newTransaction.frequency} onValueChange={(value) => setNewTransaction({ ...newTransaction, frequency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map(freq => (
                    <SelectItem key={freq} value={freq}>{freq.charAt(0).toUpperCase() + freq.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={newTransaction.nextDue}
                onChange={(e) => setNewTransaction({ ...newTransaction, nextDue: e.target.value })}
              />
              <Button onClick={handleAddTransaction} className="w-full bg-blue-500 hover:bg-blue-600">
                Add Transaction
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Estimated Monthly</p>
          <p className="text-4xl font-bold mt-2 text-blue-600">{formatCurrency(totalMonthly)}</p>
        </div>
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Estimated Yearly</p>
          <p className="text-4xl font-bold mt-2 text-green-600">{formatCurrency(totalYearly)}</p>
        </div>
      </div>

      <div className="space-y-4">
        {recurring.length === 0 ? (
          <div className="glass-effect rounded-2xl p-12 shadow-lg text-center">
            <Repeat className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No recurring transactions yet. Add one to get started!</p>
          </div>
        ) : (
          recurring.map((transaction) => (
            <div key={transaction.id} className="glass-effect rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{transaction.description}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Repeat size={14} /> {transaction.frequency}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> Due: {new Date(transaction.nextDue).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(transaction.amount)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{transaction.category}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 mt-2"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecurringTransactions;
