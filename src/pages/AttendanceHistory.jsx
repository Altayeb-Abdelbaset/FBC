import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, Download } from 'lucide-react';
import StatusBadge from '@/components/attendance/StatusBadge';
import { Button } from '@/components/ui/button';
import moment from 'moment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Navigate } from 'react-router-dom';
import WorkerPDFReport from '@/components/workers/WorkerPDFReport';


export default function AttendanceHistory() {
 const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState(moment().subtract(30, 'days').format('YYYY-MM-DD'));
  const [dateTo, setDateTo] = useState(moment().format('YYYY-MM-DD'));
  const [role, setRole] = useState(null);
  const [workers, setWorkers] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // تحميل الحضور
      const { data: attendanceData, error: attError } = await supabase
        .from('attendance')
        .select('*')
        .order('date', { ascending: false });
      
      // تحميل بيانات العمال لملف الـ PDF
      const { data: workersData } = await supabase.from('workers').select('*');
      
      if (workersData) {
        const workersMap = {};
        workersData.forEach(w => workersMap[w.id] = w);
        setWorkers(workersMap);
      }
      
      setRecords(attendanceData || []);
      setLoading(false);
    };
    load();
  }, []);

const filtered = records.filter(r => {
    const matchesSearch = !search || r.worker_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesDate = r.date >= dateFrom && r.date <= dateTo;
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Group by date
  const groupedByDate = {};
  filtered.forEach(r => {
    if (!groupedByDate[r.date]) groupedByDate[r.date] = [];
    groupedByDate[r.date].push(r);
  });
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  // Summary
  const totalPresent = filtered.filter(r => r.status === 'present').length;
  const totalAbsent = filtered.filter(r => r.status === 'absent').length;


  if (role && role !== 'admin') return <Navigate to="/attendance" replace />;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Attendance History</h1>
        <p className="text-sm text-muted-foreground mt-1">{filtered.length} records found</p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search worker..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>

            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-[150px]" />
            <span className="text-xs text-muted-foreground">to</span>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-[150px]" />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-accent/10 rounded-lg p-3 text-center">
          <p className="text-2xl font-heading font-bold text-accent">{totalPresent}</p>
          <p className="text-xs text-muted-foreground">Present</p>
        </div>
        <div className="bg-destructive/10 rounded-lg p-3 text-center">
          <p className="text-2xl font-heading font-bold text-destructive">{totalAbsent}</p>
          <p className="text-xs text-muted-foreground">Absent</p>
        </div>

      </div>

      {/* Records by date */}
      {sortedDates.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground text-sm">
          No records match your filters.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map(date => (
            <div key={date} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-3 bg-muted/50 border-b border-border flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-heading font-semibold">{moment(date).format('dddd, MMMM D, YYYY')}</span>
                <span className="text-xs text-muted-foreground ml-auto">{groupedByDate[date].length} records</span>
              </div>
              <div className="divide-y divide-border">
                {groupedByDate[date].map(record => (
                  <div key={record.id} className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {record.worker_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{record.worker_name}</p>
                        {record.additional_hours > 0 && (
                          <p className="text-xs text-muted-foreground">+{record.additional_hours}h overtime</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {record.project_name && <p className="text-xs text-muted-foreground hidden sm:block">{record.project_name}</p>}
                      {record.notes && <p className="text-xs text-muted-foreground max-w-[120px] truncate hidden md:block">{record.notes}</p>}
                      {record.updated_by && (
                        <p className="text-xs text-muted-foreground hidden lg:block">by <span className="font-medium">{record.updated_by}</span></p>
                      )}
                      <StatusBadge status={record.status} />
                      {workers[record.worker_id] && (
                        <WorkerPDFReport worker={workers[record.worker_id]} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}























