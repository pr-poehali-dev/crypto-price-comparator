import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Exchange {
  name: string;
  price: number;
  volume: number;
  fee: number;
  change24h: number;
  url?: string;
}

interface ArbitrageTabProps {
  exchanges: Exchange[];
  selectedCrypto: string;
}

export const ArbitrageTab = ({ exchanges, selectedCrypto }: ArbitrageTabProps) => {
  const sortedExchanges = [...exchanges].sort((a, b) => a.price - b.price);
  const minPrice = sortedExchanges[0];
  const maxPrice = sortedExchanges[sortedExchanges.length - 1];
  const spread = maxPrice.price - minPrice.price;

  return (
    <Card className="bg-card/50 backdrop-blur border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Target" size={24} className="text-accent" />
          Лучшая возможность сейчас
        </CardTitle>
        <CardDescription>Актуальные спреды между биржами</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
            <div className="text-sm text-muted-foreground mb-1">Купить на</div>
            <div className="text-2xl font-bold text-accent">{minPrice.name}</div>
            <div className="text-lg mt-2">${minPrice.price.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">Комиссия: {minPrice.fee}%</div>
          </div>
          
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex flex-col items-center justify-center">
            <Icon name="ArrowRight" size={32} className="text-primary mb-2" />
            <div className="text-sm text-muted-foreground">Спред</div>
            <div className="text-3xl font-bold text-primary">${spread.toFixed(2)}</div>
            <div className="text-sm text-primary/70 mt-1">{((spread / minPrice.price) * 100).toFixed(2)}%</div>
          </div>

          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="text-sm text-muted-foreground mb-1">Продать на</div>
            <div className="text-2xl font-bold text-destructive">{maxPrice.name}</div>
            <div className="text-lg mt-2">${maxPrice.price.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">Комиссия: {maxPrice.fee}%</div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Icon name="TrendingUp" size={20} className="text-accent" />
            Возможности с выгодой от 3%
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Биржа</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Цена ({selectedCrypto})</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">24ч %</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Объем (млн)</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Комиссия</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Выгода</th>
              </tr>
            </thead>
            <tbody>
              {sortedExchanges
                .filter((exchange) => {
                  const potentialProfit = ((maxPrice.price - exchange.price) / exchange.price) * 100;
                  return potentialProfit >= 3.0;
                })
                .map((exchange) => {
                  const potentialProfit = ((maxPrice.price - exchange.price) / exchange.price) * 100;
                  return (
                    <tr key={exchange.name} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-medium">{exchange.name}</td>
                      <td className="text-right py-3 px-4 font-mono">${exchange.price.toFixed(2)}</td>
                      <td className={`text-right py-3 px-4 ${exchange.change24h > 0 ? 'text-accent' : 'text-destructive'}`}>
                        {exchange.change24h > 0 ? '+' : ''}{exchange.change24h.toFixed(2)}%
                      </td>
                      <td className="text-right py-3 px-4 text-muted-foreground">${exchange.volume}M</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">{exchange.fee}%</td>
                      <td className="text-right py-3 px-4 font-bold text-accent">
                        +{potentialProfit.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              {sortedExchanges.filter((exchange) => {
                const potentialProfit = ((maxPrice.price - exchange.price) / exchange.price) * 100;
                return potentialProfit >= 3.0;
              }).length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    <Icon name="Search" size={32} className="mx-auto mb-2 opacity-50" />
                    Нет возможностей с выгодой от 3%
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
