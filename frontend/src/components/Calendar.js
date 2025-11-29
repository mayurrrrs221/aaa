import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';

const Calendar = ({ currency, formatCurrency }) => {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    type: 'expense',
    description: ''
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const loaded = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
    setEvents(loaded);
  }, []);

  // Save to localStorage when events change
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    const event = {
      id: Date.now(),
      title: newEvent.title,
      date: newEvent.date,
      amount: parseFloat(newEvent.amount),
      type: newEvent.type,
      description: newEvent.description,
      createdAt: new Date().toISOString()
    };

    setEvents([...events, event]);
    toast.success('Event added!');
    setNewEvent({ title: '', date: new Date().toISOString().split('T')[0], amount: '', type: 'expense', description: '' });
    setDialogOpen(false);
  };

  const handleDeleteEvent = (id) => {
    setEvents(events.filter(e => e.id !== id));
    toast.success('Event deleted');
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dateStr);
  };

  const previousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const days = [];
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const dayEvents = events.filter(e => new Date(e.date).getMonth() === currentDate.getMonth());

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Financial Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track important financial dates</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg">
              <Plus className="mr-2" size={18} />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Financial Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Event Title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
              <Input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Amount"
                value={newEvent.amount}
                onChange={(e) => setNewEvent({ ...newEvent, amount: e.target.value })}
              />
              <select className="w-full p-2 border rounded-lg dark:bg-gray-800" value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="reminder">Reminder</option>
              </select>
              <Input
                placeholder="Description (optional)"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
              <Button onClick={handleAddEvent} className="w-full bg-blue-500 hover:bg-blue-600">
                Add Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-effect rounded-2xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={previousMonth}>
            <ChevronLeft size={24} />
          </Button>
          <h2 className="text-2xl font-bold">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
          <Button variant="ghost" onClick={nextMonth}>
            <ChevronRight size={24} />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-bold text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const dayEvents = day ? getEventsForDate(day) : [];
            return (
              <div
                key={index}
                className={`min-h-20 p-2 rounded-lg border ${
                  day ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-gray-100 dark:bg-gray-900'
                }`}
              >
                {day && (
                  <>
                    <p className="font-bold text-sm mb-1">{day.getDate()}</p>
                    {dayEvents.slice(0, 2).map(event => (
                      <div key={event.id} className="text-xs mb-1 p-1 bg-blue-100 dark:bg-blue-900 rounded truncate relative group">
                        {event.title}
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="absolute right-0 top-0 hidden group-hover:block bg-red-500 text-white rounded-full p-0.5"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}
                    {dayEvents.length > 2 && <p className="text-xs text-gray-500">+{dayEvents.length - 2} more</p>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4">Upcoming Events</h3>
        {dayEvents.length === 0 ? (
          <p className="text-gray-500">No events this month</p>
        ) : (
          <div className="space-y-2">
            {dayEvents.sort((a, b) => new Date(a.date) - new Date(b.date)).map(event => (
              <div key={event.id} className="glass-effect rounded-lg p-4 flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-bold">{event.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(event.date).toLocaleDateString()}</p>
                  {event.description && <p className="text-sm text-gray-500">{event.description}</p>}
                </div>
                <div className="text-right">
                  <p className={`font-bold ${ event.type === 'income' ? 'text-green-600' : event.type === 'expense' ? 'text-red-600' : 'text-blue-600'}`}>
                    {event.type === 'income' ? '+' : event.type === 'expense' ? '-' : ''}{formatCurrency(event.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
