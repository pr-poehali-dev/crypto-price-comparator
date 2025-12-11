import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Exchange {
  name: string;
  price: number;
  fee: number;
}

interface ProfitVisualizationProps {
  exchanges: Exchange[];
  investmentAmount: number;
}

export const ProfitVisualization = ({ exchanges, investmentAmount }: ProfitVisualizationProps) => {
  const topOpportunities = useMemo(() => {
    if (exchanges.length < 2) return [];

    const sorted = [...exchanges].sort((a, b) => a.price - b.price);
    const opportunities = [];

    for (let i = 0; i < Math.min(3, sorted.length); i++) {
      const buyEx = sorted[i];
      for (let j = sorted.length - 1; j >= Math.max(sorted.length - 3, i + 1); j--) {
        const sellEx = sorted[j];
        
        const cryptoAmount = investmentAmount / buyEx.price;
        const buyFee = investmentAmount * (buyEx.fee / 100);
        const sellRevenue = cryptoAmount * sellEx.price;
        const sellFee = sellRevenue * (sellEx.fee / 100);
        const profit = sellRevenue - investmentAmount - buyFee - sellFee;
        const profitPercent = (profit / investmentAmount) * 100;

        opportunities.push({
          buyFrom: buyEx.name,
          sellTo: sellEx.name,
          profit,
          profitPercent,
          buyPrice: buyEx.price,
          sellPrice: sellEx.price,
          spread: sellEx.price - buyEx.price,
        });
      }
    }

    return opportunities.sort((a, b) => b.profitPercent - a.profitPercent).slice(0, 5);
  }, [exchanges, investmentAmount]);

  const maxProfit = useMemo(() => {
    return Math.max(...topOpportunities.map(o => Math.abs(o.profit)), 1);
  }, [topOpportunities]);

  if (topOpportunities.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border">
        <CardContent className="pt-6 text-center text-muted-foreground">
          <Icon name="TrendingUp" size={48} className="mx-auto mb-4 opacity-20" />
          <p>Недостаточно данных для визуализации возможностей</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur border-accent/20 shadow-lg">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Icon name="BarChart3" size={24} className="text-accent" />
          Топ-5 арбитражных возможностей
          <Badge variant="outline" className="ml-auto text-accent border-accent">
            <Icon name="Sparkles" size={14} className="mr-1" />
            Анализ
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {topOpportunities.map((opp, index) => {
          const isProfit = opp.profit > 0;
          const barWidth = (Math.abs(opp.profit) / maxProfit) * 100;
          const color = isProfit ? 'bg-green-500' : 'bg-red-500';
          const textColor = isProfit ? 'text-green-500' : 'text-red-500';
          const borderColor = isProfit ? 'border-green-500/20' : 'border-red-500/20';

          return (
            <div
              key={`${opp.buyFrom}-${opp.sellTo}`}
              className={`p-4 rounded-lg border ${borderColor} bg-card/30 transition-all hover:scale-[1.02] hover:shadow-md`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold flex items-center gap-1">
                      <Icon name="ShoppingCart" size={14} className="text-green-500" />
                      {opp.buyFrom}
                    </span>
                    <Icon name="ArrowRight" size={16} className="text-muted-foreground" />
                    <span className="font-semibold flex items-center gap-1">
                      <Icon name="TrendingUp" size={14} className="text-red-500" />
                      {opp.sellTo}
                    </span>
                  </div>
                </div>
                <div className={`text-right ${textColor} font-bold`}>
                  {isProfit ? '+' : ''}{opp.profitPercent.toFixed(2)}%
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-3 bg-secondary/20 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full ${color} rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
                    style={{ width: `${barWidth}%` }}
                  >
                    <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Icon name="DollarSign" size={12} />
                    <span className="font-mono">${opp.profit.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="TrendingUp" size={12} />
                    <span className="font-mono">${opp.spread.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <Icon name="Target" size={12} />
                    <span className="font-mono">
                      ${opp.buyPrice.toLocaleString()} → ${opp.sellPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="mt-6 p-4 bg-accent/5 rounded-lg border border-accent/20">
          <div className="flex items-start gap-2">
            <Icon name="Lightbulb" size={18} className="text-accent mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold text-accent mb-1">Как пользоваться:</p>
              <ul className="space-y-1">
                <li>• Зелёные связки — прибыльные возможности для арбитража</li>
                <li>• Красные связки — убыточные схемы (высокие комиссии)</li>
                <li>• Длина полосы показывает размер потенциальной прибыли</li>
                <li>• Процент — ROI от инвестиций в $1000</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
