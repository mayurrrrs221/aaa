import { useState } from 'react';
import axios from 'axios';
import { Plus, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const QuickAddButton = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('expense'); // 'expense' or 'income'
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    description: '',
    source: ''
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    'Food',
    'Transport',
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Bills',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'expense') {
        await axios.post(`${API}/expenses`, {
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description || 'Quick add',
          currency: 'INR'
        });
        toast.success('✅ Expense added!');
      } else {
        await axios.post(`${API}/income`, {
          amount: parseFloat(formData.amount),
          source: formData.source || 'Income',
          currency: 'INR'
        });
        toast.success('✅ Income added!');
      }
      
      // Reset form
      setFormData({
        amount: '',
        category: 'Food',
        description: '',
        source: ''
      });
      setOpen(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Button
        data-testid="quick-add-button"
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 z-50 hover:scale-110 transition-transform"
      >
        <Plus size={28} className="text-white" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="quick-add-dialog">
          <DialogHeader>
            <DialogTitle>Quick Add</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tab Selector */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                data-testid="expense-tab"
                onClick={() => setActiveTab('expense')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  activeTab === 'expense'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <DollarSign className="inline mr-2" size={18} />
                Expense
              </button>
              <button
                data-testid="income-tab"
                onClick={() => setActiveTab('income')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  activeTab === 'income'
                    ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <TrendingUp className="inline mr-2" size={18} />
                Income
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <Input
                  data-testid="quick-amount-input"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {activeTab === 'expense' ? (
                <>
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleChange('category', value)}
                    >
                      <SelectTrigger data-testid="quick-category-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                    <Input
                      data-testid="quick-description-input"
                      type="text"
                      placeholder="What did you buy?"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">Source</label>
                  <Input
                    data-testid="quick-source-input"
                    type="text"
                    placeholder="Salary, Freelance, etc."
                    value={formData.source}
                    onChange={(e) => handleChange('source', e.target.value)}
                  />
                </div>
              )}

              {/* Submit Button */}
              <Button
                data-testid="quick-add-submit"
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Adding...' : `Add ${activeTab === 'expense' ? 'Expense' : 'Income'}`}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickAddButton;
