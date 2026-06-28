import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabaseClient'; // تأكد من استيراد السوبابيز
import { Users, UserCheck, UserX } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import StatusBadge from '@/components/attendance/StatusBadge';
import moment from 'moment';

export default function Dashboard() {
  const [workers, setWorkers] = useState([]);
  const [todayRecords, setTodayRecords] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  


// داخل الـ Dashboard Component
useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    const today = moment().format('YYYY-MM-DD');

    // جلب البيانات من Supabase
    const [
      { data: workersData },
      { data: attendanceToday },
      { data: recentAttendance }
    ] = await Promise.all([
      supabase.from('workers').select('*'),
      supabase.from('attendance').select('*').eq('date', today),
      supabase.from('attendance').select('*').order('date', { ascending: false }).limit(10)
    ]);

    setWorkers(workersData || []);
    setTodayRecords(attendanceToday || []);
    setRecentRecords(recentAttendance || []);
    setLoading(false);
  };

  loadData();
}, []);



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const totalActive = workers.length;
  const present = todayRecords.filter(r => r.status === 'present').length;
  const absent = todayRecords.filter(r => r.status === 'absent').length;
  const unmarked = totalActive - todayRecords.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">{moment().format('dddd, MMMM D, YYYY')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Workers" value={totalActive} subtitle="Active employees" color="blue" />
        <StatCard icon={UserCheck} label="Present Today" value={present} subtitle={`${unmarked} unmarked`} color="green" />
        <StatCard icon={UserX} label="Absent Today" value={absent} color="red" />
      </div>

      {/* Attendance rate bar */}
      {totalActive > 0 && todayRecords.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-heading font-semibold">Today's Attendance Rate</h2>
            <span className="text-2xl font-bold font-heading text-primary">
              {Math.round((present / totalActive) * 100)}%
            </span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden flex">
            {present > 0 && <div className="h-full bg-accent" style={{ width: `${(present / totalActive) * 100}%` }} />}
            {absent > 0 && <div className="h-full bg-destructive" style={{ width: `${(absent / totalActive) * 100}%` }} />}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent" /> Present</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-destructive" /> Absent</span>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-card rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-heading font-semibold">Recent Activity</h2>
        </div>
        {recentRecords.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No attendance records yet. Go to the Attendance page to start marking.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentRecords.slice(0, 8).map(record => (
              <div key={record.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {record.worker_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{record.worker_name}</p>
                    <p className="text-xs text-muted-foreground">{moment(record.date).format('MMM D, YYYY')}</p>
                  </div>
                </div>
                <StatusBadge status={record.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}