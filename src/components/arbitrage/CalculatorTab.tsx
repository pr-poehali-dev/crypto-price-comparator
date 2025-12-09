import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Exchange {
  name: string;
  price: number;
  volume: number;
  fee: number;
  change24h: number;
  url?: string;
}

interface CalculatorTabProps {
  exchanges: Exchange[];
  selectedCrypto: string;
  amount: string;
  setAmount: (value: string) => void;
}

export const CalculatorTab = ({ exchanges, selectedCrypto, amount, setAmount }: CalculatorTabProps) => {
  const sortedExchanges = [...exchanges].sort((a, b) => a.price - b.price);
  const minPrice = sortedExchanges[0];
  const maxPrice = sortedExchanges[sortedExchanges.length - 1];
  const amountNum = parseFloat(amount) || 0;
  const buyTotal = minPrice.price * amountNum * (1 + minPrice.fee / 100);
  const sellTotal = maxPrice.price * amountNum * (1 - maxPrice.fee / 100);
  const profit = sellTotal - buyTotal;
  const profitPercent = ((profit / buyTotal) * 100).toFixed(2);

  return (
    <Card className="bg-card/50 backdrop-blur border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
          <Icon name="Calculator" size={24} className="text-primary" />
          Калькулятор прибыли
        </CardTitle>
        <CardDescription className="text-sm">Расчет потенциальной прибыли с учетом комиссий</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Количество {selectedCrypto}</label>
          <Input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1.0"
            className="text-base md:text-lg"
            inputMode="decimal"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="p-4 md:p-6 rounded-lg bg-accent/10 border border-accent/20">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Icon name="ShoppingCart" size={18} className="text-accent" />
              <span className="font-medium text-sm md:text-base">Покупка</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">Биржа:</span>
                <span className="font-medium">{minPrice.name}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">Цена за {selectedCrypto}:</span>
                <span className="font-mono">${minPrice.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">Комиссия ({minPrice.fee}%):</span>
                <span className="font-mono">${(minPrice.price * amountNum * minPrice.fee / 100).toFixed(2)}</span>
              </div>
              <div className="border-t border-accent/20 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-medium text-sm md:text-base">Итого:</span>
                  <span className="font-bold text-base md:text-lg">${buyTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Icon name="DollarSign" size={18} className="text-destructive" />
              <span className="font-medium text-sm md:text-base">Продажа</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">Биржа:</span>
                <span className="font-medium">{maxPrice.name}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">Цена за {selectedCrypto}:</span>
                <span className="font-mono">${maxPrice.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">Комиссия ({maxPrice.fee}%):</span>
                <span className="font-mono">${(maxPrice.price * amountNum * maxPrice.fee / 100).toFixed(2)}</span>
              </div>
              <div className="border-t border-destructive/20 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-medium text-sm md:text-base">Итого:</span>
                  <span className="font-bold text-base md:text-lg">${sellTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 rounded-lg bg-primary/20 border-2 border-primary">
          <div className="text-center">
            <div className="text-xs md:text-sm text-muted-foreground mb-2">Чистая прибыль</div>
            <div className="text-3xl md:text-5xl font-bold text-primary mb-2">
              ${profit.toFixed(2)}
            </div>
            <div className="text-xl md:text-2xl text-primary/80">
              {profitPercent}%
            </div>
          </div>
        </div>

        <Button 
          className="w-full" 
          size="lg"
          onClick={() => {
            window.open(minPrice.url || 'https://www.binance.com', '_blank');
            setTimeout(() => {
              window.open(maxPrice.url || 'https://www.coinbase.com', '_blank');
            }, 500);
          }}
        >
          <Icon name="Zap" size={20} className="mr-2" />
          Начать арбитраж
        </Button>
      </CardContent>
    </Card>
  );
};
