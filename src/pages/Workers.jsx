import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2, UserCircle, Building2 } from 'lucide-react'; // ضفنا أيقونة Building2 للمشروع
import WorkerFormDialog from '@/components/workers/WorkerFormDialog';

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editWorker, setEditWorker] = useState(null);

  const loadWorkers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .order('full_name', { ascending: true });

    if (!error) setWorkers(data || []);
    setLoading(false);
  };

  useEffect(() => { loadWorkers(); }, []);

  const handleSave = async (formData) => {
    if (editWorker) {
      await supabase.from('workers').update(formData).eq('id', editWorker.id);
    } else {
      await supabase.from('workers').insert([formData]);
    }
    setEditWorker(null);
    loadWorkers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this worker?')) return;
    await supabase.from('workers').delete().eq('id', id);
    loadWorkers();
  };

  // تعديل البحث ليشمل المشروع أيضاً
  const filtered = workers.filter(w =>
    w.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    w.role?.toLowerCase().includes(search.toLowerCase()) ||
    w.project_name?.toLowerCase().includes(search.toLowerCase()) 
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Workers</h1>
          <p className="text-sm text-muted-foreground mt-1">{workers.length} registered</p>
        </div>
        <Button onClick={() => { setEditWorker(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Worker
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, role, or project..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <UserCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No results found.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(worker => (
            <div key={worker.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {worker.full_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{worker.full_name}</p>
                    <p className="text-xs text-muted-foreground">ID: {worker.worker_id}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditWorker(worker); setDialogOpen(true); }} className="p-1.5 rounded-md hover:bg-muted">
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDelete(worker.id)} className="p-1.5 rounded-md hover:bg-destructive/10">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-1 border-t pt-3">
                <p className="text-xs font-semibold text-primary">{worker.role || 'No role'}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="w-3 h-3" />
                  <span>{worker.project_name || 'No project assigned'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <WorkerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        worker={editWorker}
        onSave={handleSave}
      />
    </div>
  );
}