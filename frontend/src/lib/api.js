// Mock API Service with Working Data

const getDashboard = () => ({
  income: 50000,
  expenses: 25000,
  savings: 25000,
  categories: [
    { name: 'Food', value: 5000 },
    { name: 'Transport', value: 3000 },
    { name: 'Entertainment', value: 2000 },
    { name: 'Shopping', value: 8000 },
    { name: 'Bills', value: 7000 }
  ],
  topExpenses: [
    { id: 1, category: 'Food', description: 'Groceries', amount: 500 },
    { id: 2, category: 'Transport', description: 'Uber ride', amount: 200 },
    { id: 3, category: 'Entertainment', description: 'Movie tickets', amount: 300 }
  ]
});

const getTrends = () => [
  { day: 'Mon', amount: 800 },
  { day: 'Tue', amount: 1200 },
  { day: 'Wed', amount: 950 },
  { day: 'Thu', amount: 1100 },
  { day: 'Fri', amount: 1500 },
  { day: 'Sat', amount: 2000 },
  { day: 'Sun', amount: 1300 }
];

const getExpenses = () => [
  { id: 1, description: 'Coffee', amount: 150, category: 'Food', merchant: 'Cafe', date: new Date().toISOString(), currency: 'INR', is_regret: false },
  { id: 2, description: 'Uber ride', amount: 200, category: 'Transport', merchant: 'Uber', date: new Date().toISOString(), currency: 'INR', is_regret: false },
  { id: 3, description: 'Movie ticket', amount: 300, category: 'Entertainment', merchant: 'PVR Cinema', date: new Date().toISOString(), currency: 'INR', is_regret: false }
];

const getSubscriptions = () => [
  { id: 1, name: 'Netflix', amount: 500, category: 'Entertainment', billing_cycle: 'monthly', status: 'active' },
  { id: 2, name: 'Spotify', amount: 299, category: 'Entertainment', billing_cycle: 'monthly', status: 'active' },
  { id: 3, name: 'YouTube Premium', amount: 129, category: 'Entertainment', billing_cycle: 'monthly', status: 'active' }
];

const getGoals = () => [
  { id: 1, title: 'Emergency Fund', target_amount: 100000, current_amount: 45000, category: 'Savings', target_date: '2024-12-31' },
  { id: 2, title: 'Vacation Fund', target_amount: 50000, current_amount: 15000, category: 'Travel', target_date: '2024-06-30' },
  { id: 3, title: 'New Laptop', target_amount: 100000, current_amount: 60000, category: 'Electronics', target_date: '2024-05-31' }
];

export { getDashboard, getTrends, getExpenses, getSubscriptions, getGoals };
