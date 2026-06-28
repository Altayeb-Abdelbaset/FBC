import React from 'react';

export default function StatCard({ icon: Icon, label, value, subtitle, color }) {
  const colorMap = {
    blue: 'bg-primary/10 text-primary',
    green: 'bg-accent/10 text-accent',
    yellow: 'bg-chart-3/10 text-chart-3',
    red: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-heading font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color] || colorMap.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}