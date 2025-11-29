import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PriceTracker = ({ currency, formatCurrency }) => {
  const [trackers, setTrackers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedTracker, setSelectedTracker] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [newTracker, setNewTracker] = useState({
    product_name: '',
    current_price: '',
    target_price: '',
    url: ''
  });

  useEffect(() => {
    fetchTrackers();
  }, []);

  const fetchTrackers = async () => {
    try {
      const response = await axios.get(`${API}/price-tracker`);
      setTrackers(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load price trackers');
      setLoading(false);
    }
  };

  const handleAddTracker = async () => {
    if (!newTracker.product_name || !newTracker.current_price) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      await axios.post(`${API}/price-tracker`, {
        ...newTracker,
        current_price: parseFloat(newTracker.current_price),
        target_price: newTracker.target_price ? parseFloat(newTracker.target_price) : null,
        currency
      });
      toast.success('Price tracker added!');
      fetchTrackers();
      setNewTracker({ product_name: '', current_price: '', target_price: '', url: '' });
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add tracker');
    }
  };

  const handleUpdatePrice = async () => {
    if (!newPrice || !selectedTracker) return;

    try {
      await axios.put(`${API}/price-tracker/${selectedTracker}/update-price`, {
        new_price: parseFloat(newPrice)
      });
      toast.success('Price updated!');
      fetchTrackers();
      setNewPrice('');
      setUpdateDialogOpen(false);
      setSelectedTracker(null);
    } catch (error) {
      toast.error('Failed to update price');
    }
  };

  const getPriceTrend = (history) => {
    if (history.length < 2) return 'stable';
    const latest = history[history.length - 1].price;
    const previous = history[history.length - 2].price;
    return latest > previous ? 'up' : latest < previous ? 'down' : 'stable';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="price-tracker-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Price Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor product prices over time</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-tracker-btn" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg">
              <Plus className="mr-2" size={18} />
              Add Tracker
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Price Tracker</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                data-testid="tracker-product-name"
                placeholder="Product Name"
                value={newTracker.product_name}
                onChange={(e) => setNewTracker({ ...newTracker, product_name: e.target.value })}
              />
              <Input
                data-testid="tracker-current-price"
                type="number"
                placeholder="Current Price"
                value={newTracker.current_price}
                onChange={(e) => setNewTracker({ ...newTracker, current_price: e.target.value })}
              />
              <Input
                data-testid="tracker-target-price"
                type="number"
                placeholder="Target Price (optional)"
                value={newTracker.target_price}
                onChange={(e) => setNewTracker({ ...newTracker, target_price: e.target.value })}
              />
              <Input
                data-testid="tracker-url"
                placeholder="Product URL (optional)"
                value={newTracker.url}
                onChange={(e) => setNewTracker({ ...newTracker, url: e.target.value })}
              />
              <Button 
                data-testid="submit-tracker"
                onClick={handleAddTracker} 
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                Add Tracker
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trackers.length === 0 ? (
          <div className="col-span-2 glass-effect rounded-2xl p-12 shadow-lg text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No price trackers yet. Add one to start monitoring!</p>
          </div>
        ) : (
          trackers.map((tracker) => {
            const trend = getPriceTrend(tracker.price_history);
            const chartData = tracker.price_history.map(item => ({
              date: new Date(item.date).toLocaleDateString(),
              price: item.price
            }));
            
            return (
              <div 
                key={tracker.id} 
                data-testid={`tracker-item-${tracker.id}`}
                className="glass-effect rounded-2xl p-6 shadow-lg card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{tracker.product_name}</h3>
                    {tracker.url && (
                      <a 
                        href={tracker.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline mt-1 block"
                      >
                        View Product
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {trend === 'up' && <TrendingUp className="text-red-500" size={20} />}
                    {trend === 'down' && <TrendingDown className="text-green-500" size={20} />}
                    <Button
                      data-testid={`update-price-${tracker.id}`}
                      size="sm"
                      onClick={() => {
                        setSelectedTracker(tracker.id);
                        setUpdateDialogOpen(true);
                      }}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Update Price
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Current Price</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {formatCurrency(tracker.current_price)}
                    </p>
                  </div>
                  {tracker.target_price && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Target Price</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(tracker.target_price)}
                      </p>
                    </div>
                  )}
                </div>
                
                {chartData.length > 1 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Price History</h4>
                    <ResponsiveContainer width="100%" height={150}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#64748b" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
                        <Tooltip />
                        <Line type="monotone" dataKey="price" stroke="#f97316" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Price</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              data-testid="new-price-input"
              type="number"
              placeholder="New Price"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
            />
            <Button 
              data-testid="submit-price-update"
              onClick={handleUpdatePrice} 
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PriceTracker;