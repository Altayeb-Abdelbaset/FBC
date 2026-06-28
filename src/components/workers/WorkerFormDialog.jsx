import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function WorkerFormDialog({ open, onOpenChange, worker, onSave }) {
  const [formData, setFormData] = useState({
    full_name: '',
    worker_id: '',
    role: '',
    kafaala: '',
    project_name: '' // الخانة الجديدة
  });

  useEffect(() => {
    if (worker) setFormData(worker);
    else setFormData({ full_name: '', worker_id: '', role: '', kafaala: '', project_name: '' });
  }, [worker]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{worker ? 'Edit' : 'Add'} Worker</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <Label>Full Name</Label>
          <Input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
          
          <Label>Worker ID</Label>
          <Input value={formData.worker_id} onChange={e => setFormData({...formData, worker_id: e.target.value})} />
          
          <Label>Role</Label>
          <Input value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
          
          <Label>Kafaala</Label>
          <Input value={formData.kafaala} onChange={e => setFormData({...formData, kafaala: e.target.value})} />

          {/* خانة المشروع الجديدة */}
          <Label>Project Name</Label>
          <Input 
            value={formData.project_name || ''} 
            onChange={e => setFormData({...formData, project_name: e.target.value})} 
            
          />
        </div>
        <DialogFooter>
          <Button onClick={() => {
            onSave(formData);
            onOpenChange(false); // قفل النافذة بعد الحفظ
          }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}