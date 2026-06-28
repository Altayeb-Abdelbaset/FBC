import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import moment from 'moment';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function WorkerPDFReport({ worker }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(moment().format('YYYY-MM'));
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);

    const startDate = moment(month).startOf('month').format('YYYY-MM-DD');
    const endDate = moment(month).endOf('month').format('YYYY-MM-DD');

   const { data: records, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('worker_id', worker.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });
    const filtered = records
      .filter(r => r.date >= startDate && r.date <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalPresent = filtered.filter(r => r.status === 'present').length;
    const totalOvertime = filtered.reduce((sum, r) => sum + (Number(r.additional_hours) || 0), 0);

    const statusLabel = (r) => {
      if (r.status === 'present') return { text: 'حاضر', color: '#16a34a', bg: '#dcfce7' };
      return { text: 'غائب', color: '#dc2626', bg: '#fee2e2' };
    };

    const tableRows = filtered.map((r, i) => {
      const s = statusLabel(r);
      return `
        <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;text-align:right;">${r.date}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;text-align:right;">${moment(r.date).format('dddd')}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;text-align:center;">
            <span style="background:${s.bg};color:${s.color};padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600;">${s.text}</span>
          </td>
          <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;text-align:center;">${(Number(r.additional_hours) || 0).toFixed(2)}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;text-align:right;">${r.project_name || '-'}</td>
        </tr>
      `;
    }).join('');

    const html = `
  <div id="pdf-root" style="font-family:'Cairo','Arial',sans-serif;direction:rtl;width:794px;background:#fff;padding:32px 36px;color:#1e293b;font-size:13px;">

    <div style="background:#0e7490;border-radius:10px 10px 0 0;padding:20px;display:flex;justify-content:space-between;align-items:center;">
      <div style="color:#fff;">
        <div style="font-size:10px;margin-bottom:4px;opacity:0.8;">الاسم</div>
        <div style="font-size:16px;font-weight:700;">${worker.full_name || '-'}</div>
      </div> 
      <div style="text-align:center;color:#fff;">
        <div style="font-size:10px;margin-bottom:4px;opacity:0.8;">رقم العامل</div>
        <div style="font-size:16px;font-weight:700;">${worker.employee_id || '-'}</div>
      </div>
      <div style="text-align:center;color:#fff;">
        <div style="font-size:10px;margin-bottom:4px;opacity:0.8;">المهنة</div>
        <div style="font-size:16px;font-weight:700;">${worker.role || worker.department || '-'}</div>
      </div>
      <div style="text-align:center;color:#fff;">
        <div style="font-size:10px;margin-bottom:4px;opacity:0.8;">أيام الحضور</div>
        <div style="font-size:24px;font-weight:700;">${totalPresent}</div>
      </div>
    </div>

    <div style="background:#e0f2fe;border-radius:0 0 10px 10px;padding:8px 20px;text-align:right;font-size:11px;color:#0e7490;font-weight:600;margin-bottom:22px;">
      الفترة: ${moment(month).startOf('month').format('DD-MM-YYYY')} → ${moment(month).endOf('month').format('DD-MM-YYYY')}
    </div>

    <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:#f1f5f9;">
          <th style="padding:12px;text-align:right;font-size:12px;font-weight:700;border-bottom:2px solid #e2e8f0;vertical-align:middle;">التاريخ</th>
          <th style="padding:12px;text-align:right;font-size:12px;font-weight:700;border-bottom:2px solid #e2e8f0;vertical-align:middle;">اليوم</th>
          <th style="padding:12px;text-align:center;font-size:12px;font-weight:700;border-bottom:2px solid #e2e8f0;vertical-align:middle;">الحالة</th>
          <th style="padding:12px;text-align:center;font-size:12px;font-weight:700;border-bottom:2px solid #e2e8f0;vertical-align:middle;">ساعات إضافية</th>
          <th style="padding:12px;text-align:right;font-size:12px;font-weight:700;border-bottom:2px solid #e2e8f0;vertical-align:middle;">المشروع</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
        <tr style="background:#0e7490;">
          <td colspan="3" style="padding:12px;text-align:right;color:#fff;font-weight:700;font-size:13px;vertical-align:middle;">الإجمالي ساعات إضافية:</td>
          <td style="padding:12px;text-align:center;color:#fff;font-weight:700;font-size:13px;vertical-align:middle;">${totalOvertime.toFixed(2)}</td>
          <td style="padding:12px;"></td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top:28px;border-top:1px dashed #cbd5e1;padding-top:18px;text-align:right;">
      <p style="font-size:12px;color:#475569;margin-bottom:16px;">التوقيع: __________________________</p>
      <p style="font-size:12px;font-weight:700;color:#0e7490;text-align:center;">تم إنشاؤه بواسطة تطبيق FBC للحضور</p>
      <p style="font-size:11px;color:#94a3b8;text-align:center;">تم تطويره بواسطة م. الطيب عبدالباسط</p>
    </div>

  </div>
`;

    // Mount hidden container
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:-99999px;left:-99999px;';
    container.innerHTML = html;
    document.body.appendChild(container);

    // Wait for Cairo font
    await document.fonts.load('700 13px Cairo');
    await new Promise(r => setTimeout(r, 500));

    const el = container.querySelector('#pdf-root');
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    document.body.removeChild(container);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const pageH = 297;
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;

    let y = 0;
    while (y < imgH) {
      if (y > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, -y, imgW, imgH);
      y += pageH;
    }

    pdf.save(`${worker.full_name}_${month}_attendance.pdf`);
    setGenerating(false);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-md hover:bg-primary/10"
        title="تقرير PDF"
      >
        <FileText className="w-3.5 h-3.5 text-primary" />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border shadow-xl p-6 w-full max-w-sm" dir="rtl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-base">إنشاء تقرير PDF</h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              تقرير لـ <span className="font-semibold text-foreground">{worker.full_name}</span>
            </p>
            <div className="mb-5">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">اختر الشهر</label>
              <input
                type="month"
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <Button onClick={generate} disabled={generating} className="w-full gap-2">
              <FileText className="w-4 h-4" />
              {generating ? 'جاري الإنشاء...' : 'تحميل PDF'}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}