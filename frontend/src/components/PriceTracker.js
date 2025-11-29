import { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PriceTracker = ({ currency, formatCurrency }) => {
  const [trackers, setTrackers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTracker, setNewTracker] = useState({
    productName: '',
    currentPrice: '',
    targetPrice: '',
    category: 'Electronics',
    notes: ''
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const loaded = JSON.parse(localStorage.getItem('priceTrackers') || '[]');
    setTrackers(loaded);
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('priceTrackers', JSON.stringify(trackers));
  }, [trackers]);

  const handleAddTracker = () => {
    if (!newTracker.productName || !newTracker.currentPrice) {
      toast.error('Please fill in product name and price');
      return;
    }

    const tracker = {
      id: Date.now(),
      productName: newTracker.productName,
      currentPrice: parseFloat(newTracker.currentPrice),
      targetPrice: parseFloat(newTracker.targetPrice) || null,
      category: newTracker.category,
      notes: newTracker.notes,
      priceHistory: [{ date: new Date().toLocaleDateString(), price: parseFloat(newTracker.currentPrice) }],
      createdAt: new Date().toISOString()
    };

    setTrackers([...trackers, tracker]);
    toast.success('Price tracker added!');
    setNewTracker({ productName: '', currentPrice: '', targetPrice: '', category: 'Electronics', notes: '' });
    setDialogOpen(false);
  };

  const handleUpdatePrice = (id, newPrice) => {
    setTrackers(trackers.map(t => {
      if (t.id === id) {
        const updatedHistory = [...(t.priceHistory || []), { date: new Date().toLocaleDateString(), price: parseFloat(newPrice) }];
        return { ...t, currentPrice: parseFloat(newPrice), priceHistory: updatedHistory };
      }
      return t;
    }));
    toast.success('Price updated!');
  };

  const handleDeleteTracker = (id) => {
    setTrackers(trackers.filter(t => t.id !== id));
    toast.success('Tracker deleted');
  };

  const getPriceDifference = (tracker) => {
    if (tracker.targetPrice) {
      return tracker.targetPrice - tracker.currentPrice;
    }
    return null;
  };

  const isPriceGood = (tracker) => {
    if (tracker.targetPrice) {
      return tracker.currentPrice <= tracker.targetPrice;
    }
    return false;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Price Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor product prices over time</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg">
              <Plus className="mr-2" size={18} />
              Add Price Tracker
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Track Product Price</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Product Name"
                value={newTracker.productName}
                onChange={(e) => setNewTracker({ ...newTracker, productName: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Current Price"
                value={newTracker.currentPrice}
                onChange={(e) => setNewTracker({ ...newTracker, currentPrice: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Target Price (when to buy)"
                value={newTracker.targetPrice}
                onChange={(e) => setNewTracker({ ...newTracker, targetPrice: e.target.value })}
              />
              <Input
                placeholder="Category (e.g., Electronics, Books)"
                value={newTracker.category}
                onChange={(e) => setNewTracker({ ...newTracker, category: e.target.value })}
              />
              <Input
                placeholder="Notes (optional)"
                value={newTracker.notes}
                onChange={(e) => setNewTracker({ ...newTracker, notes: e.target.value })}
              />
              <Button onClick={handleAddTracker} className="w-full bg-blue-500 hover:bg-blue-600">
                Add Tracker
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {trackers.length === 0 ? (
          <div className="glass-effect rounded-2xl p-12 shadow-lg text-center">
            <TrendingUp className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No price trackers yet. Add one to start monitoring!</p>
          </div>
        ) : (
          trackers.map((tracker) => {
            const priceDiff = getPriceDifference(tracker);
            const isBuyTime = isPriceGood(tracker);
            return (
              <div key={tracker.id} className={`glass-effect rounded-2xl p-6 shadow-lg ${ isBuyTime ? 'border-2 border-green-500' : '' }`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{tracker.productName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{tracker.category}</p>
                    {tracker.notes && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{tracker.notes}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTracker(tracker.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Current Price</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(tracker.currentPrice)}</p>
                  </div>
                  {tracker.targetPrice && (
                    <>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Target Price</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(tracker.targetPrice)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Difference</p>
                        <p className={`text-xl font-bold ${priceDiff <= 0 ? 'text-red-600' : 'text-orange-600'}`}>
                          {priceDiff <= 0 ? '🎉 BUY NOW' : formatCurrency(priceDiff)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                        <p className={`text-lg font-bold ${isBuyTime ? 'text-green-600' : 'text-orange-600'}`}>
                          {isBuyTime ? '✅ Good Price' : '⏳ Waiting'}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <Input
                    type="number"
                    placeholder="Update current price..."
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdatePrice(tracker.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <Button
                    onClick={(e) => {
                      const input = e.target.previousSibling;
                      handleUpdatePrice(tracker.id, input.value);
                      input.value = '';
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Update
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PriceTracker;
