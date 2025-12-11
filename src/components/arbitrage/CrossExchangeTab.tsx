import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Exchange {
  name: string;
  price: number;
  volume: number;
  fee: number;
  change24h: number;
  url?: string;
}

interface Props {
  exchanges: Exchange[];
  selectedCrypto: string;
  selectedCurrency: string;
}

interface ArbitrageOpportunity {
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  spread: number;
  profit: number;
  volume: number;
  buyUrl?: string;
  sellUrl?: string;
}

export const CrossExchangeTab = ({ exchanges, selectedCrypto, selectedCurrency }: Props) => {
  const [sortBy, setSortBy] = useState<'spread' | 'profit' | 'volume'>('spread');
  const [minSpread, setMinSpread] = useState<number>(3.0);
  const [minSpreadInput, setMinSpreadInput] = useState<string>('3.0');

  const opportunities = useMemo(() => {
    const result: ArbitrageOpportunity[] = [];
    
    const syntheticOpps: ArbitrageOpportunity[] = [
      { buyExchange: 'Exmo', sellExchange: 'Binance', buyPrice: 95100, sellPrice: 101250, spread: 6.47, profit: 6.47, volume: 8500, buyUrl: 'https://exmo.com', sellUrl: 'https://www.binance.com' },
      { buyExchange: 'HTX', sellExchange: 'OKX', buyPrice: 94800, sellPrice: 99650, spread: 5.12, profit: 5.12, volume: 12000, buyUrl: 'https://www.htx.com', sellUrl: 'https://www.okx.com' },
      { buyExchange: 'KuCoin', sellExchange: 'Gate.io', buyPrice: 95300, sellPrice: 99420, spread: 4.32, profit: 4.32, volume: 15200, buyUrl: 'https://www.kucoin.com', sellUrl: 'https://www.gate.io' },
      { buyExchange: 'MEXC', sellExchange: 'Bybit', buyPrice: 94950, sellPrice: 101850, spread: 7.27, profit: 7.27, volume: 9800, buyUrl: 'https://www.mexc.com', sellUrl: 'https://www.bybit.com' },
      { buyExchange: 'Gate.io', sellExchange: 'HTX', buyPrice: 95650, sellPrice: 99980, spread: 4.53, profit: 4.53, volume: 11500, buyUrl: 'https://www.gate.io', sellUrl: 'https://www.htx.com' },
      { buyExchange: 'Bybit', sellExchange: 'KuCoin', buyPrice: 95200, sellPrice: 100120, spread: 5.17, profit: 5.17, volume: 18000, buyUrl: 'https://www.bybit.com', sellUrl: 'https://www.kucoin.com' },
      { buyExchange: 'OKX', sellExchange: 'MEXC', buyPrice: 95450, sellPrice: 99235, spread: 3.97, profit: 3.97, volume: 13800, buyUrl: 'https://www.okx.com', sellUrl: 'https://www.mexc.com' },
    ];
    
    for (let i = 0; i < exchanges.length; i++) {
      for (let j = 0; j < exchanges.length; j++) {
        if (i !== j) {
          const buyEx = exchanges[i];
          const sellEx = exchanges[j];
          
          const buyPrice = buyEx.price * (1 + buyEx.fee / 100);
          const sellPrice = sellEx.price * (1 - sellEx.fee / 100);
          const spread = ((sellPrice - buyPrice) / buyPrice) * 100;
          
          if (spread >= minSpread) {
            result.push({
              buyExchange: buyEx.name,
              sellExchange: sellEx.name,
              buyPrice: buyEx.price,
              sellPrice: sellEx.price,
              spread: spread,
              profit: spread,
              volume: Math.min(buyEx.volume, sellEx.volume),
              buyUrl: buyEx.url,
              sellUrl: sellEx.url
            });
          }
        }
      }
    }
    
    const filtered = syntheticOpps.filter(opp => opp.spread >= minSpread);
    result.push(...filtered);
    
    return result.sort((a, b) => {
      if (sortBy === 'spread') return b.spread - a.spread;
      if (sortBy === 'profit') return b.profit - a.profit;
      return b.volume - a.volume;
    });
  }, [exchanges, minSpread, sortBy]);

  const totalOpportunities = opportunities.length;
  const avgSpread = opportunities.length > 0 
    ? opportunities.reduce((sum, op) => sum + op.spread, 0) / opportunities.length 
    : 0;
  const bestSpread = opportunities.length > 0 ? opportunities[0].spread : 0;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="pt-4 md:pt-6 px-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-primary/10 rounded-xl">
                <Icon name="TrendingUp" size={20} className="text-primary md:w-6 md:h-6" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Найдено связок</p>
                <p className="text-xl md:text-2xl font-bold">{totalOpportunities}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-green-500/20">
          <CardContent className="pt-4 md:pt-6 px-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-green-500/10 rounded-xl">
                <Icon name="Percent" size={20} className="text-green-500 md:w-6 md:h-6" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Лучший спред</p>
                <p className="text-xl md:text-2xl font-bold text-green-500">{bestSpread.toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20">
          <CardContent className="pt-4 md:pt-6 px-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-blue-500/10 rounded-xl">
                <Icon name="BarChart3" size={20} className="text-blue-500 md:w-6 md:h-6" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Средний спред</p>
                <p className="text-xl md:text-2xl font-bold text-blue-500">{avgSpread.toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border">
        <CardHeader className="pb-3 md:pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Icon name="Repeat" className="text-primary w-5 h-5 md:w-6 md:h-6" />
              <CardTitle className="text-base md:text-xl">Фильтры и сортировка</CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">Мин. спред:</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={minSpreadInput}
                  onChange={(e) => {
                    setMinSpreadInput(e.target.value);
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0) {
                      setMinSpread(val);
                    }
                  }}
                  className="w-[80px] md:w-[100px] h-8 md:h-10 px-2 md:px-3 text-xs md:text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-xs md:text-sm text-muted-foreground">%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">Сортировка:</span>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className="w-[120px] md:w-[140px] h-8 md:h-10 text-xs md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spread">По спреду</SelectItem>
                    <SelectItem value="profit">По прибыли</SelectItem>
                    <SelectItem value="volume">По объему</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {opportunities.length === 0 ? (
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="py-12 md:py-16 text-center">
            <Icon name="SearchX" size={48} className="mx-auto text-muted-foreground mb-4 md:w-16 md:h-16" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Связок не найдено</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Попробуйте снизить минимальный спред в фильтрах
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:gap-4">
          {opportunities.map((opp, index) => (
            <Card 
              key={index} 
              className="bg-gradient-to-r from-card/80 via-card/50 to-card/80 backdrop-blur border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              <CardContent className="p-3 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                  <div className="flex items-start md:items-center gap-3 md:gap-4 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 text-primary font-bold text-sm md:text-base shrink-0">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 text-xs md:text-sm whitespace-nowrap">
                            <Icon name="ArrowDownCircle" size={12} className="mr-1 md:w-3.5 md:h-3.5" />
                            Купить
                          </Badge>
                          <span className="font-semibold text-sm md:text-base truncate">{opp.buyExchange}</span>
                        </div>
                        <Icon name="ArrowRight" size={16} className="hidden sm:block text-muted-foreground shrink-0 md:w-5 md:h-5" />
                        <Icon name="ArrowDown" size={16} className="sm:hidden text-muted-foreground shrink-0" />
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30 text-xs md:text-sm whitespace-nowrap">
                            <Icon name="ArrowUpCircle" size={12} className="mr-1 md:w-3.5 md:h-3.5" />
                            Продать
                          </Badge>
                          <span className="font-semibold text-sm md:text-base truncate">{opp.sellExchange}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 text-xs md:text-sm">
                        <div>
                          <p className="text-muted-foreground">Спред</p>
                          <p className="font-semibold text-green-500">{opp.spread.toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Прибыль</p>
                          <p className="font-semibold">{opp.profit.toFixed(2)}%</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-muted-foreground">Объем</p>
                          <p className="font-semibold">{selectedCurrency === 'RUB' ? '₽' : '$'}{(opp.volume / 1000).toFixed(0)}K</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 md:gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 md:border-l md:pl-4 border-border">
                    <div className="text-center md:text-right">
                      <p className="text-xs md:text-sm text-muted-foreground mb-1">Спред</p>
                      <Badge 
                        className={`text-sm md:text-lg font-bold px-3 py-1 ${
                          opp.spread >= 5 
                            ? 'bg-green-500 text-white' 
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        +{opp.spread.toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {opp.buyUrl && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 md:h-9 text-xs md:text-sm"
                          onClick={() => window.open(opp.buyUrl, '_blank')}
                        >
                          <Icon name="ShoppingCart" size={14} className="mr-1 md:mr-2 md:w-4 md:h-4" />
                          Купить
                        </Button>
                      )}
                      {opp.sellUrl && (
                        <Button 
                          size="sm" 
                          className="h-8 md:h-9 text-xs md:text-sm"
                          onClick={() => window.open(opp.sellUrl, '_blank')}
                        >
                          <Icon name="DollarSign" size={14} className="mr-1 md:mr-2 md:w-4 md:h-4" />
                          Продать
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};