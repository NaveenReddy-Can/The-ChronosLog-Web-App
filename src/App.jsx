import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Clock, ChevronLeft, ChevronRight, Plus, Briefcase, Home, Book, Coffee, Play, Utensils, Trophy, Bed, Brush, ShoppingCart, Phone } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';

// PASTE YOUR ACTUAL DATA HERE
const SUPABASE_URL = "https://xhvqowzmehcocgdoafvw.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_publishable_5j90aYYxZCMir62_Gn6GyQ_CkwcBFGT";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CATEGORIES = [
  { name: 'Work', color: 'bg-blue-600' }, { name: 'Home', color: 'bg-emerald-500' },
  { name: 'Study', color: 'bg-violet-500' }, { name: 'Leisure', color: 'bg-amber-500' },
  { name: 'Entertainment', color: 'bg-rose-500' }, { name: 'Cooking', color: 'bg-orange-500' },
  { name: 'Sports', color: 'bg-red-500' }, { name: 'Sleeping', color: 'bg-indigo-600' },
  { name: 'Cleaning', color: 'bg-teal-500' }, { name: 'Shopping', color: 'bg-sky-500' },
  { name: 'Calls', color: 'bg-slate-500' }
];

export default function App() {
  const [date, setDate] = useState(new Date());
  const [logs, setLogs] = useState({});

  useEffect(() => { fetchLogs(); }, [date]);

  const fetchLogs = async () => {
    const { data } = await supabase.from('activities').select('*').eq('log_date', format(date, 'yyyy-MM-dd'));
    const map = {};
    data?.forEach(l => map[l.hour_of_day] = l);
    setLogs(map);
  };

  const saveLog = async (hour, task, cat) => {
    await supabase.from('activities').upsert({
      log_date: format(date, 'yyyy-MM-dd'),
      hour_of_day: hour, task_name: task, category: cat
    }, { onConflict: 'log_date, hour_of_day' });
    fetchLogs();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <nav className="bg-white border-b p-4 sticky top-0 z-10 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-600"><Clock/> ChronosLog</h1>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setDate(subDays(date, 1))} className="p-1 hover:bg-white rounded"><ChevronLeft/></button>
          <span className="text-sm font-bold px-4">{format(date, 'MMM do, yyyy')}</span>
          <button onClick={() => setDate(addDays(date, 1))} className="p-1 hover:bg-white rounded"><ChevronRight/></button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto mt-6 px-4">
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => (
            <HourRow key={i} hour={i} data={logs[i]} onSave={saveLog} />
          ))}
        </div>
      </main>
    </div>
  );
}

function HourRow({ hour, data, onSave }) {
  const [edit, setEdit] = useState(false);
  const [task, setTask] = useState(data?.task_name || '');
  const [cat, setCat] = useState(data?.category || 'Work');

  const label = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour-12} PM`;

  return (
    <div className="border-b last:border-0 flex items-center p-3 hover:bg-slate-50 transition-all min-h-[64px]">
      <div className="w-16 text-[10px] font-bold text-slate-400 uppercase">{label}</div>
      {edit ? (
        <div className="flex-1 flex gap-2">
          <input className="flex-1 border rounded px-2 py-1 text-sm outline-none border-indigo-200" value={task} onChange={e => setTask(e.target.value)} autoFocus />
          <select className="text-xs border rounded" value={cat} onChange={e => setCat(e.target.value)}>
            {CATEGORIES.map(c => <option key={c.name}>{c.name}</option>)}
          </select>
          <button onClick={() => {onSave(hour, task, cat); setEdit(false)}} className="bg-indigo-600 text-white px-3 rounded text-xs">Save</button>
        </div>
      ) : (
        <div className="flex-1 flex justify-between items-center cursor-pointer group" onClick={() => setEdit(true)}>
          <div className="flex items-center gap-3">
            {data ? (
              <><span className={`h-2 w-2 rounded-full ${CATEGORIES.find(c=>c.name===data.category)?.color}`}></span>
                <span className="text-sm font-medium text-slate-700">{data.task_name}</span></>
            ) : <span className="text-slate-300 italic text-sm">Nothing logged...</span>}
          </div>
          <Plus size={16} className="text-slate-200 opacity-0 group-hover:opacity-100" />
        </div>
      )}
    </div>
  );
}