import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // أضفنا useNavigate
import { supabase } from "@/lib/supabaseClient"; // استيراد Supabase
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

 const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1. تسجيل الدخول
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2. جلب الرول من جدول profiles عشان نعرف يروح فين
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      setError("خطأ في جلب صلاحيات المستخدم");
      setLoading(false);
      return;
    }

    // 3. التوجيه بناءً على الرول
    if (profile.role === 'admin') {
      navigate("/"); // الأدمن يروح للداشبورد
    } else {
      navigate("/attendance"); // الموظف يروح لصفحة الحضور
    }
    
    setLoading(false);
  };



  return (
    // الـ UI كما هو تماماً
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Sign in to your account"
      
    >
     
       

      {/* باقي الـ UI كما هو ... */}
      
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* الحقول كما هي */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</> : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}




















