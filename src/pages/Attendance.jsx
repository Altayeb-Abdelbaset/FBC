import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Save, CheckCircle2 } from 'lucide-react';
import moment from 'moment';

const statuses = ['present', 'absent'];

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [workers, setWorkers] = useState([]);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const { userProfile } = useAuth();

  const loadData = useCallback(async () => {
    if (!userProfile) return;
    setLoading(true);
    setSaved(false);

    // تعديل الفلترة: جلب العمال التابعين لمشروع اليوزر فقط
    let workersQuery = supabase
      .from('workers')
      .select('*')
      .eq('status', 'active');

    if (userProfile.role !== 'admin' && userProfile.project_name) {
      workersQuery = workersQuery.eq('project_name', userProfile.project_name);
    }

    const { data: workersList } = await workersQuery;

    const { data: attendanceList } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', selectedDate);

    setWorkers(workersList || []);
    
    const map = {};
    (attendanceList || []).forEach(a => {
      map[a.worker_id] = { id: a.id, status: a.status, additional_hours: a.additional_hours ?? '', notes: a.notes || '' };
    });
    setRecords(map);
    setLoading(false);
  }, [selectedDate, userProfile]);

  useEffect(() => { loadData(); }, [loadData]);

  const updateRecord = (workerId, field, value) => {
    setRecords(prev => ({
      ...prev,
      [workerId]: { ...(prev[workerId] || { status: 'present', additional_hours: '', notes: '' }), [field]: value }
    }));
    setSaved(false);
  };

  const markAll = (status) => {
    const updated = {};
    workers.forEach(w => {
      updated[w.id] = { ...(records[w.id] || { additional_hours: '', notes: '' }), status };
    });
    setRecords(updated);
    setSaved(false);
  };

  const saveAll = async () => {
    setSaving(true);
    
    const recordsToUpsert = workers.map(worker => {
      const rec = records[worker.id] || { status: 'present' };
      return {
        worker_id: worker.id,
        worker_name: worker.full_name,
        project_name: worker.project_name, // إضافة اسم المشروع
        date: selectedDate,
        status: rec.status,
        additional_hours: rec.additional_hours !== '' ? Number(rec.additional_hours) : null,
        notes: rec.notes || '',
        updated_by: userProfile?.email || 'unknown'
      };
    });

    const { error } = await supabase
      .from('attendance')
      .upsert(recordsToUpsert, { onConflict: 'worker_id, date' });

    if (error) {
      alert('فشل الحفظ: ' + error.message);
    } else {
      setSaved(true);
    }
    setSaving(false);
  };

  const changeDate = (offset) => {
    setSelectedDate(moment(selectedDate).add(offset, 'days').format('YYYY-MM-DD'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Mark Attendance</h1>
          <p className="text-sm text-muted-foreground mt-1">{workers.length} active workers</p>
        </div>
        <Button onClick={saveAll} disabled={saving || workers.length === 0} className="gap-2">
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save All'}
        </Button>
      </div>

      <div className="flex items-center gap-3 bg-card rounded-xl border border-border p-3">
        <button onClick={() => changeDate(-1)} className="p-2 rounded-lg hover:bg-muted"><ChevronLeft className="w-4 h-4" /></button>
        <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="max-w-[180px] text-center" />
        <button onClick={() => changeDate(1)} className="p-2 rounded-lg hover:bg-muted"><ChevronRight className="w-4 h-4" /></button>
        <span className="text-sm text-muted-foreground hidden sm:block">{moment(selectedDate).format('dddd, MMMM D, YYYY')}</span>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={() => markAll('present')} className="text-xs">All Present</Button>
          <Button size="sm" variant="outline" onClick={() => markAll('absent')} className="text-xs">All Absent</Button>
        </div>
      </div>

      {workers.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground text-sm">
          No active workers found.
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
            <div className="col-span-3">العامــل</div>
            <div className="col-span-3">الحالــة</div>
            <div className="col-span-2">الساعــات الاضافيــة</div>
            <div className="col-span-4">ملاحظـــات</div>
          </div>
          <div className="divide-y divide-border">
            {workers.map(worker => {
              const rec = records[worker.id] || {};
              return (
                <div key={worker.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-5 py-4 items-center">
                  <div className="md:col-span-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {worker.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{worker.full_name}</p>
                      <p className="text-xs text-muted-foreground">{worker.employee_id}</p>
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {statuses.map(s => (
                        <button key={s} onClick={() => updateRecord(worker.id, 'status', s)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${rec.status === s ? (s === 'present' ? 'bg-green-600 text-white border-green-600' : 'bg-red-600 text-white border-red-600') : 'bg-transparent text-muted-foreground border-border hover:bg-muted'}`}>
                          {s.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Input type="number" value={rec.additional_hours ?? ''} onChange={e => updateRecord(worker.id, 'additional_hours', e.target.value)} className="text-xs h-8" placeholder="0" />
                  </div>
                  <div className="md:col-span-4">
                    <Input value={rec.notes || ''} onChange={e => updateRecord(worker.id, 'notes', e.target.value)} className="text-xs h-8" placeholder="Add notes..." />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}