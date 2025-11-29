import { useState } from 'react';
import { Trash2, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const Subscriptions = ({ currency, formatCurrency }) => {
  const [subscriptions] = useState([
    { id: 1, name: 'Netflix', amount: 500, category: 'Entertainment', billing_cycle: 'monthly', status: 'active' },
    { id: 2, name: 'Spotify', amount: 299, category: 'Entertainment', billing_cycle: 'monthly', status: 'active' },
    { id: 3, name: 'YouTube Premium', amount: 129, category: 'Entertainment', billing_cycle: 'monthly', status: 'active' }
  ]);
  
  const [newSubscription, setNewSubscription] = useState({
    name: '',
    category: 'Entertainment',
    amount: '',
    billing_cycle: 'monthly',
    status: 'active'
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const categories = ['Entertainment', 'Productivity', 'Finance', 'Health', 'Education', 'Other'];
  const billing_cycles = ['daily', 'weekly', 'monthly', 'yearly'];

  const handleAddSubscription = () => {
    if (!newSubscription.name || !newSubscription.amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success('Subscription added successfully!');
    setNewSubscription({ name: '', category: 'Entertainment', amount: '', billing_cycle: 'monthly', status: 'active' });
    setDialogOpen(false);
  };

  const handleDeleteSubscription = (id) => {
    toast.success('Subscription deleted');
  };

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + (sub.billing_cycle === 'monthly' ? sub.amount : 0), 0);
  const totalYearly = subscriptions.reduce((sum, sub) => sum + (sub.billing_cycle === 'yearly' ? sub.amount : 0), 0);

  return (
    <div className="p-8" data-testid="subscriptions-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Subscriptions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your recurring subscriptions</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg">
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
                data-testid="subscription-name"
                placeholder="Subscription Name"
                value={newSubscription.name}
                onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
              />
              <Select 
                value={newSubscription.category} 
                onValueChange={(value) => setNewSubscription({ ...newSubscription, category: value })}
              >
                <SelectTrigger data-testid="subscription-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                data-testid="subscription-amount"
                type="number"
                placeholder="Amount"
                value={newSubscription.amount}
                onChange={(e) => setNewSubscription({ ...newSubscription, amount: e.target.value })}
              />
              <Select 
                value={newSubscription.billing_cycle} 
                onValueChange={(value) => setNewSubscription({ ...newSubscription, billing_cycle: value })}
              >
                <SelectTrigger data-testid="subscription-billing">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {billing_cycles.map(cycle => (
                    <SelectItem key={cycle} value={cycle}>{cycle.charAt(0).toUpperCase() + cycle.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                data-testid="submit-subscription"
                onClick={handleAddSubscription} 
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                Add Subscription
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Monthly Cost</p>
          <p className="text-4xl font-bold mt-2 text-blue-600">{formatCurrency(totalMonthly)}</p>
        </div>
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Yearly Cost</p>
          <p className="text-4xl font-bold mt-2 text-purple-600">{formatCurrency(totalYearly)}</p>
        </div>
      </div>

      <div className="glass-effect rounded-2xl p-6 shadow-lg">
        <div className="space-y-4">
          {subscriptions.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-500 dark:text-gray-400">No subscriptions yet. Add your first one!</p>
              </div>
            </div>
          ) : (
            subscriptions.map((subscription) => (
              <div 
                key={subscription.id} 
                data-testid={`subscription-item-${subscription.id}`}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{subscription.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subscription.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {subscription.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{subscription.category} • {subscription.billing_cycle}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {formatCurrency(subscription.amount)}
                  </p>
                  <Button
                    data-testid={`delete-subscription-${subscription.id}`}
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSubscription(subscription.id)}
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

export default Subscriptions;
