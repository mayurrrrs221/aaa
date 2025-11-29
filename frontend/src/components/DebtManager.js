import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DebtManager = ({ currency, formatCurrency }) => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDebt, setNewDebt] = useState({
    name: '',
    principal_amount: '',
    interest_rate: '',
    tenure_months: '',
    start_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    try {
      const response = await axios.get(`${API}/debts`);
      setDebts(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load debts');
      setLoading(false);
    }
  };

  const handleAddDebt = async () => {
    if (!newDebt.name || !newDebt.principal_amount || !newDebt.tenure_months) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await axios.post(`${API}/debts`, {
        ...newDebt,
        principal_amount: parseFloat(newDebt.principal_amount),
        interest_rate: parseFloat(newDebt.interest_rate) || 0,
        tenure_months: parseInt(newDebt.tenure_months)
      });
      
      toast.success('Debt added successfully!');
      setShowAddDialog(false);
      setNewDebt({
        name: '',
        principal_amount: '',
        interest_rate: '',
        tenure_months: '',
        start_date: new Date().toISOString().split('T')[0]
      });
      fetchDebts();
    } catch (error) {
      toast.error('Failed to add debt');
    }
  };

  const handleDeleteDebt = async (debtId) => {
    try {
      await axios.delete(`${API}/debts/${debtId}`);
      toast.success('Debt deleted');
      fetchDebts();
    } catch (error) {
      toast.error('Failed to delete debt');
    }
  };

  const handleMarkAsPaid = async (debtId) => {
    try {
      await axios.put(`${API}/debts/${debtId}`, { status: 'paid' });
      toast.success('Marked as paid!');
      fetchDebts();
    } catch (error) {
      toast.error('Failed to update debt');
    }
  };

  const totalActiveDebt = debts
    .filter(d => d.status === 'active')
    .reduce((sum, d) => sum + d.principal_amount, 0);

  const totalMonthlyEMI = debts
    .filter(d => d.status === 'active')
    .reduce((sum, d) => sum + d.emi_amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8" data-testid="debt-manager">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold gradient-text">💳 Debt Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track loans and calculate EMI</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button data-testid="add-debt-btn" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg">
              <Plus className="mr-2" size={18} />
              Add Debt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Debt/Loan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Debt Name *</Label>
                <Input
                  data-testid="debt-name"
                  placeholder="e.g., Home Loan, Car Loan"
                  value={newDebt.name}
                  onChange={(e) => setNewDebt({...newDebt, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label>Principal Amount (₹) *</Label>
                <Input
                  data-testid="principal-amount"
                  type="number"
                  placeholder="100000"
                  value={newDebt.principal_amount}
                  onChange={(e) => setNewDebt({...newDebt, principal_amount: e.target.value})}
                />
              </div>
              
              <div>
                <Label>Annual Interest Rate (%) *</Label>
                <Input
                  data-testid="interest-rate"
                  type="number"
                  step="0.1"
                  placeholder="10.5"
                  value={newDebt.interest_rate}
                  onChange={(e) => setNewDebt({...newDebt, interest_rate: e.target.value})}
                />
              </div>
              
              <div>
                <Label>Tenure (Months) *</Label>
                <Input
                  data-testid="tenure-months"
                  type="number"
                  placeholder="24"
                  value={newDebt.tenure_months}
                  onChange={(e) => setNewDebt({...newDebt, tenure_months: e.target.value})}
                />
              </div>
              
              <div>
                <Label>Start Date</Label>
                <Input
                  data-testid="start-date"
                  type="date"
                  value={newDebt.start_date}
                  onChange={(e) => setNewDebt({...newDebt, start_date: e.target.value})}
                />
              </div>
              
              <Button 
                data-testid="submit-debt"
                onClick={handleAddDebt} 
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                <Calculator className="mr-2" size={18} />
                Calculate & Add
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Active Debt</h3>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
            {formatCurrency(totalActiveDebt)}
          </p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Monthly EMI</h3>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
            {formatCurrency(totalMonthlyEMI)}
          </p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Debts</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {debts.filter(d => d.status === 'active').length}
          </p>
        </Card>
      </div>

      {/* Debts List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Debts</h2>
        
        {debts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No debts tracked yet. Add one to start!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {debts.map((debt) => (
              <Card 
                key={debt.id} 
                className={`p-6 ${debt.status === 'paid' ? 'opacity-50' : ''}`}
                data-testid={`debt-card-${debt.id}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{debt.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                      debt.status === 'active' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' 
                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {debt.status === 'active' ? 'Active' : 'Paid'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDebt(debt.id)}
                    data-testid={`delete-debt-${debt.id}`}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Principal:</span>
                    <span className="font-semibold">{formatCurrency(debt.principal_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Interest Rate:</span>
                    <span className="font-semibold">{debt.interest_rate}% p.a.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tenure:</span>
                    <span className="font-semibold">{debt.tenure_months} months</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-gray-600 dark:text-gray-400">Monthly EMI:</span>
                    <span className="font-bold text-orange-600">{formatCurrency(debt.emi_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Interest:</span>
                    <span className="font-semibold text-red-600">{formatCurrency(debt.total_interest)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Payable:</span>
                    <span className="font-bold">{formatCurrency(debt.total_payable)}</span>
                  </div>
                </div>
                
                {debt.status === 'active' && (
                  <Button
                    className="w-full mt-4 bg-green-500 hover:bg-green-600"
                    onClick={() => handleMarkAsPaid(debt.id)}
                    data-testid={`mark-paid-${debt.id}`}
                  >
                    Mark as Paid
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtManager;
