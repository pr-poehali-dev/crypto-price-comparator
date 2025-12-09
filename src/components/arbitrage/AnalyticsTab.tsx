import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

interface AnalyticsTabProps {
  priceHistory: Array<{ time: string; spread: number; profit: number }>;
}

export const AnalyticsTab = ({ priceHistory }: AnalyticsTabProps) => {
  return (
    <Card className="bg-card/50 backdrop-blur border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="TrendingUp" size={24} className="text-primary" />
          История спредов
        </CardTitle>
        <CardDescription>Динамика арбитражных возможностей за последние 24 часа</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceHistory}>
              <defs>
                <linearGradient id="colorSpread" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="spread" 
                stroke="hsl(var(--primary))" 
                fill="url(#colorSpread)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Макс. спред 24ч</div>
            <div className="text-2xl font-bold text-primary">$460</div>
            <div className="text-xs text-primary/70 mt-1">0.48%</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-accent/10 border border-accent/20">
            <div className="text-sm text-muted-foreground mb-1">Средний спред</div>
            <div className="text-2xl font-bold text-accent">$268</div>
            <div className="text-xs text-accent/70 mt-1">0.28%</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="text-sm text-muted-foreground mb-1">Возможностей</div>
            <div className="text-2xl font-bold text-destructive">24</div>
            <div className="text-xs text-destructive/70 mt-1">за 24 часа</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
