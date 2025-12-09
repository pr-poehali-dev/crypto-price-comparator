import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useEffect, useState } from 'react';

interface Exchange {
  name: string;
  price: number;
  volume: number;
  fee: number;
  change24h: number;
  url?: string;
  dataSource?: string;
}

interface BestSchemeCardProps {
  exchanges: Exchange[];
  selectedCrypto: string;
}

interface BestScheme {
  buyFrom: string;
  sellTo: string;
  spread: number;
  netProfit: number;
  netProfitPercent: number;
  buyUrl?: string;
  sellUrl?: string;
  buyPrice: number;
  sellPrice: number;
}

export const BestSchemeCard = ({ exchanges, selectedCrypto }: BestSchemeCardProps) => {
  const [bestScheme, setBestScheme] = useState<BestScheme | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    if (exchanges.length === 0) return;

    const sortedExchanges = [...exchanges].sort((a, b) => a.price - b.price);
    
    const topSpreads = sortedExchanges.slice(0, 5).map((lowExchange) => {
      const highExchanges = sortedExchanges.slice(-3);
      return highExchanges.map((highExchange) => {
        const spreadValue = highExchange.price - lowExchange.price;
        const netProfit = spreadValue - (lowExchange.price * lowExchange.fee / 100) - (highExchange.price * highExchange.fee / 100);
        const netProfitPct = (netProfit / lowExchange.price) * 100;

        return {
          buyFrom: lowExchange.name,
          sellTo: highExchange.name,
          spread: spreadValue,
          netProfit,
          netProfitPercent: netProfitPct,
          buyUrl: lowExchange.url,
          sellUrl: highExchange.url,
          buyPrice: lowExchange.price,
          sellPrice: highExchange.price,
        };
      });
    }).flat().sort((a, b) => b.netProfitPercent - a.netProfitPercent)[0];

    if (topSpreads) {
      const isNewScheme = !bestScheme || 
        bestScheme.buyFrom !== topSpreads.buyFrom || 
        bestScheme.sellTo !== topSpreads.sellTo;
      
      if (isNewScheme) {
        setIsNew(true);
        setTimeout(() => setIsNew(false), 3000);
      }
      
      setBestScheme(topSpreads);
    }
  }, [exchanges, bestScheme]);

  if (exchanges.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur border-border">
        <CardContent className="pt-6 px-4 pb-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Icon name="RefreshCw" size={48} className="text-muted-foreground mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Загрузка актуальных цен...</h3>
            <p className="text-sm text-muted-foreground">Получаем данные с бирж в реальном времени</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bestScheme) {
    return null;
  }

  return (
    <Card className={`bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 backdrop-blur border-2 transition-all duration-500 ${isNew ? 'border-primary shadow-lg shadow-primary/50 scale-[1.02]' : 'border-primary/50'}`}>
      <CardContent className="pt-4 md:pt-6 px-4 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isNew ? 'bg-primary animate-pulse' : 'bg-primary/20'}`}>
              <Icon name="Zap" size={20} className={isNew ? 'text-primary-foreground' : 'text-primary'} />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-foreground">
                {isNew && <span className="text-primary mr-2">🔥 НОВАЯ!</span>}
                Лучшая схема сейчас
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Обновляется автоматически каждую минуту
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl md:text-3xl font-bold text-primary">
              {bestScheme.netProfitPercent.toFixed(2)}%
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">чистая прибыль</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
          <div className="p-3 md:p-4 rounded-lg bg-accent/20 border border-accent/30">
            <div className="text-xs text-muted-foreground mb-1">1. Купить на</div>
            <div className="text-lg md:text-xl font-bold text-accent">{bestScheme.buyFrom}</div>
            <div className="text-xs md:text-sm text-muted-foreground mt-1">
              ${bestScheme.buyPrice.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-center">
              <Icon name="ArrowRight" size={32} className="text-primary mx-auto mb-1 hidden md:block" />
              <Icon name="ArrowDown" size={32} className="text-primary mx-auto mb-1 md:hidden" />
              <div className="text-xs md:text-sm text-muted-foreground">Спред</div>
              <div className="text-lg md:text-xl font-bold text-primary">
                ${bestScheme.spread.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="p-3 md:p-4 rounded-lg bg-destructive/20 border border-destructive/30">
            <div className="text-xs text-muted-foreground mb-1">2. Продать на</div>
            <div className="text-lg md:text-xl font-bold text-destructive">{bestScheme.sellTo}</div>
            <div className="text-xs md:text-sm text-muted-foreground mt-1">
              ${bestScheme.sellPrice.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Чистая прибыль на 1 {selectedCrypto}</div>
              <div className="text-xl md:text-2xl font-bold text-primary">
                ${bestScheme.netProfit.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">На $1000</div>
              <div className="text-xl md:text-2xl font-bold text-primary">
                ${(bestScheme.netProfitPercent * 10).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <Button 
          className="w-full" 
          size="lg"
          onClick={() => {
            window.open(bestScheme.buyUrl || '#', '_blank');
            setTimeout(() => {
              window.open(bestScheme.sellUrl || '#', '_blank');
            }, 500);
          }}
        >
          <Icon name="ExternalLink" size={20} className="mr-2" />
          Запустить схему прямо сейчас
        </Button>
      </CardContent>
    </Card>
  );
};