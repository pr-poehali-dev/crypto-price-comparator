import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

interface AIPredictionTabProps {
  aiPrediction: Array<{ time: string; value: number }>;
}

export const AIPredictionTab = ({ aiPrediction }: AIPredictionTabProps) => {
  return (
    <Card className="bg-card/50 backdrop-blur border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Brain" size={24} className="text-accent" />
          AI Прогноз цен
        </CardTitle>
        <CardDescription>Предсказание движения цен на основе машинного обучения</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={aiPrediction}>
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
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--accent))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--accent))', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/20">
          <div className="flex items-start gap-3">
            <Icon name="Lightbulb" size={24} className="text-accent flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-accent mb-2">Рекомендация AI</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                На основе анализа исторических данных и текущих трендов, ожидается рост цены на 1.05% в 
                ближайшие 12 часов. Оптимальное время для арбитража: текущий момент, так как спред 
                находится выше среднего значения.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Прогноз +12ч</div>
            <div className="text-2xl font-bold text-primary">$96,420</div>
            <div className="text-xs text-primary/70 mt-1">+1.05%</div>
          </div>
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
            <div className="text-sm text-muted-foreground mb-1">Точность модели</div>
            <div className="text-2xl font-bold text-accent">94.2%</div>
            <div className="text-xs text-accent/70 mt-1">за последние 30 дней</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
