import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, ShieldCheck, Shield, Users } from 'lucide-react';

export default function InviteUsers() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [project, setProject] = useState(''); // خانة المشروع الجديدة
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);
  const [invitedList, setInvitedList] = useState([]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus(null);

    try {
      // 1. إرسال رابط الدعوة
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email,
        options: { emailRedirectTo: window.location.origin + '/attendance' },
      });
      if (authError) throw authError;

      // 2. تسجيل الدور والمشروع في جدول profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([{ 
          email: email, 
          role: role, 
          assigned_project: project // إضافة اسم المشروع هنا
        }], { onConflict: 'email' });

      if (profileError) throw profileError;

      setStatus({ type: 'success', message: `تمت الإضافة بنجاح لـ ${email} في مشروع ${project}` });
      setInvitedList(prev => [...prev, { email, role, project }]);
      setEmail('');
      setProject('');
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-heading font-bold">Invite Users</h1>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Email Address</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@example.com" required />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Project Name</label>
            <Input value={project} onChange={e => setProject(e.target.value)}  required />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setRole('user')} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${role === 'user' ? 'bg-primary text-white' : 'bg-transparent'}`}>User</button>
              <button type="button" onClick={() => setRole('admin')} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${role === 'admin' ? 'bg-primary text-white' : 'bg-transparent'}`}>Admin</button>
            </div>
          </div>

          {status && <div className={`p-3 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{status.message}</div>}

          <Button type="submit" disabled={sending} className="w-full gap-2">
            <UserPlus className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Invitation'}
          </Button>
        </form>
      </div>
    </div>
  );
}