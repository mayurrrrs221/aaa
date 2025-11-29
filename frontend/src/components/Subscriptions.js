import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Subscriptions = ({ currency, formatCurrency }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [totalCost, setTotalCost] = useState({ monthly_total: 0, yearly_total: 0 });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSub, setNewSub] = useState({
    name: '',
    amount: '',
    billing_cycle: 'monthly',
    next_billing_date: '',
    category: 'Entertainment'
  });

  const categories = ['Entertainment', 'Software', 'Fitness', 'Music', 'Cloud Storage', 'Other'];

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const [subsRes, totalRes] = await Promise.all([
        axios.get(`${API}/subscriptions`),
        axios.get(`${API}/subscriptions/total`)
      ]);
      setSubscriptions(subsRes.data);
      setTotalCost(totalRes.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load subscriptions');
      setLoading(false);
    }
  };

  const handleAddSubscription = async () => {
    if (!newSub.name || !newSub.amount || !newSub.next_billing_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await axios.post(`${API}/subscriptions`, {
        ...newSub,
        amount: parseFloat(newSub.amount),
        currency
      });
      toast.success('Subscription added!');
      fetchSubscriptions();
      setNewSub({ name: '', amount: '', billing_cycle: 'monthly', next_billing_date: '', category: 'Entertainment' });
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add subscription');
    }
  };

  const handleDeleteSubscription = async (id) => {
    try {
      await axios.delete(`${API}/subscriptions/${id}`);
      toast.success('Subscription deleted');
      fetchSubscriptions();
    } catch (error) {
      toast.error('Failed to delete subscription');
    }
  };

  const getDaysUntilBilling = (dateStr) => {
    const nextBilling = new Date(dateStr);
    const today = new Date();
    const diffTime = nextBilling - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="subscriptions-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Subscriptions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your recurring payments</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-subscription-btn" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg">
              <Plus className="mr-2" size={18} />
              Add Subscription
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subscription</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                data-testid="sub-name"
                placeholder="Subscription Name (e.g., Netflix)"
                value={newSub.name}
                onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
              />
              <Input
                data-testid="sub-amount"
                type="number"
                placeholder="Amount"
                value={newSub.amount}
                onChange={(e) => setNewSub({ ...newSub, amount: e.target.value })}
              />
              <Select 
                value={newSub.billing_cycle} 
                onValueChange={(value) => setNewSub({ ...newSub, billing_cycle: value })}
              >
                <SelectTrigger data-testid="sub-billing-cycle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={newSub.category} 
                onValueChange={(value) => setNewSub({ ...newSub, category: value })}
              >
                <SelectTrigger data-testid="sub-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                data-testid="sub-next-billing"
                type="date"
                value={newSub.next_billing_date}
                onChange={(e) => setNewSub({ ...newSub, next_billing_date: e.target.value })}
              />
              <Button 
                data-testid="submit-subscription"
                onClick={handleAddSubscription} 
                className="w-full bg-purple-500 hover:bg-purple-600"
              >
                Add Subscription
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Monthly Cost</h3>
          <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
            {formatCurrency(totalCost.monthly_total)}
          </p>
        </div>
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Yearly Cost</h3>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(totalCost.yearly_total)}
          </p>
        </div>
      </div>

      <div className="glass-effect rounded-2xl p-6 shadow-lg">
        <div className="space-y-4">
          {subscriptions.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No subscriptions yet. Add your first subscription!</p>
          ) : (
            subscriptions.map((sub) => {
              const daysUntil = getDaysUntilBilling(sub.next_billing_date);
              const isUpcoming = daysUntil <= 7 && daysUntil > 0;
              
              return (
                <div 
                  key={sub.id} 
                  data-testid={`subscription-item-${sub.id}`}
                  className={`flex items-center justify-between p-4 rounded-xl transition-shadow ${
                    isUpcoming 
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700' 
                      : 'bg-white dark:bg-gray-800 hover:shadow-md'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{sub.name}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        {sub.category}
                      </span>
                      {isUpcoming && (
                        <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                          <AlertCircle size={16} />
                          <span className="text-xs font-medium">Due in {daysUntil} days</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Billed {sub.billing_cycle}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Next billing: {new Date(sub.next_billing_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {formatCurrency(sub.amount)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">per {sub.billing_cycle === 'monthly' ? 'month' : 'year'}</p>
                    </div>
                    <Button
                      data-testid={`delete-subscription-${sub.id}`}
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSubscription(sub.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;