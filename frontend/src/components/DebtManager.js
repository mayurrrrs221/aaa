import { useState, useEffect } from 'react';
import { Plus, Trash2, DollarSign, TrendingDown, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Progress } from './ui/progress';

const DebtManager = ({ currency, formatCurrency }) => {
  const [debts, setDebts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDebt, setNewDebt] = useState({
    creditorName: '',
    totalAmount: '',
    paidAmount: '',
    interestRate: '0',
    dueDate: ''
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const loaded = JSON.parse(localStorage.getItem('debts') || '[]');
    setDebts(loaded);
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('debts', JSON.stringify(debts));
  }, [debts]);

  const handleAddDebt = () => {
    if (!newDebt.creditorName || !newDebt.totalAmount || !newDebt.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const debt = {
      id: Date.now(),
      creditorName: newDebt.creditorName,
      totalAmount: parseFloat(newDebt.totalAmount),
      paidAmount: parseFloat(newDebt.paidAmount) || 0,
      interestRate: parseFloat(newDebt.interestRate) || 0,
      dueDate: newDebt.dueDate,
      createdAt: new Date().toISOString()
    };

    setDebts([...debts, debt]);
    toast.success('Debt added!');
    setNewDebt({ creditorName: '', totalAmount: '', paidAmount: '', interestRate: '0', dueDate: '' });
    setDialogOpen(false);
  };

  const handleDeleteDebt = (id) => {
    setDebts(debts.filter(d => d.id !== id));
    toast.success('Debt deleted');
  };

  const handleUpdatePaid = (id, newPaidAmount) => {
    setDebts(debts.map(d => 
      d.id === id ? { ...d, paidAmount: Math.min(parseFloat(newPaidAmount), d.totalAmount) } : d
    ));
    toast.success('Debt payment updated!');
  };

  const totalDebt = debts.reduce((sum, d) => sum + (d.totalAmount || 0), 0);
  const totalPaid = debts.reduce((sum, d) => sum + (d.paidAmount || 0), 0);
  const remainingDebt = totalDebt - totalPaid;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Debt Manager</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track and manage your debts</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg">
              <Plus className="mr-2" size={18} />
              Add Debt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Debt</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Creditor Name"
                value={newDebt.creditorName}
                onChange={(e) => setNewDebt({ ...newDebt, creditorName: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Total Amount"
                value={newDebt.totalAmount}
                onChange={(e) => setNewDebt({ ...newDebt, totalAmount: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Amount Already Paid"
                value={newDebt.paidAmount}
                onChange={(e) => setNewDebt({ ...newDebt, paidAmount: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Interest Rate (%) - Optional"
                value={newDebt.interestRate}
                onChange={(e) => setNewDebt({ ...newDebt, interestRate: e.target.value })}
              />
              <Input
                type="date"
                placeholder="Due Date"
                value={newDebt.dueDate}
                onChange={(e) => setNewDebt({ ...newDebt, dueDate: e.target.value })}
              />
              <Button onClick={handleAddDebt} className="w-full bg-red-500 hover:bg-red-600">
                Add Debt
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Total Debt</p>
          <p className="text-4xl font-bold mt-2 text-red-600">{formatCurrency(totalDebt)}</p>
        </div>
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Total Paid</p>
          <p className="text-4xl font-bold mt-2 text-green-600">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="glass-effect rounded-2xl p-6 shadow-lg">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Remaining</p>
          <p className="text-4xl font-bold mt-2 text-orange-600">{formatCurrency(remainingDebt)}</p>
        </div>
      </div>

      <div className="space-y-4">
        {debts.length === 0 ? (
          <div className="glass-effect rounded-2xl p-12 shadow-lg text-center">
            <DollarSign className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No debts tracked yet. Add one to get started!</p>
          </div>
        ) : (
          debts.map((debt) => {
            const paymentPercentage = (debt.paidAmount / debt.totalAmount) * 100;
            return (
              <div key={debt.id} className="glass-effect rounded-2xl p-6 shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{debt.creditorName}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> Due: {new Date(debt.dueDate).toLocaleDateString()}
                      </span>
                      {debt.interestRate > 0 && (
                        <span>Interest: {debt.interestRate}%</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteDebt(debt.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-semibold">{paymentPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={paymentPercentage} className="h-3" />
                  
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                      <p className="font-bold text-red-600">{formatCurrency(debt.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
                      <p className="font-bold text-green-600">{formatCurrency(debt.paidAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
                      <p className="font-bold text-orange-600">{formatCurrency(debt.totalAmount - debt.paidAmount)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Input
                      type="number"
                      placeholder="Add payment amount"
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdatePaid(debt.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <Button
                      onClick={(e) => {
                        const input = e.target.previousSibling;
                        handleUpdatePaid(debt.id, input.value);
                        input.value = '';
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Pay
                    </Button>
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

export default DebtManager;
