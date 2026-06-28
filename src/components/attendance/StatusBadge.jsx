import React from 'react';

const styles = {
  present: 'bg-accent/10 text-accent border-accent/20',
  absent: 'bg-destructive/10 text-destructive border-destructive/20',
  late: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  half_day: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
};

const labels = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  half_day: 'Half Day',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || ''}`}>
      {labels[status] || status}
    </span>
  );
}