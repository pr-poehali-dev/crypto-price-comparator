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

interface Props {
  selectedCurrency: string;
}

interface CryptoChain {
  chain: string[];
  exchanges: string[];
  startAmount: number;
  endAmount: number;
  profit: number;
  profitPercent: number;
  steps: {
    from: string;
    to: string;
    exchange: string;
    rate: number;
    amount: number;
  }[];
}

const CRYPTO_PRICES = {
  BTC: 95420,
  ETH: 3580,
  USDT: 1.0,
  SOL: 185,
  XRP: 2.35,
  BNB: 620,
  ADA: 1.05,
  DOGE: 0.38,
  AVAX: 42,
  DOT: 7.8,
  MATIC: 0.95,
  LTC: 98,
};

const EXCHANGES = ['Binance', 'Bybit', 'OKX', 'KuCoin', 'Gate.io', 'HTX'];

export const CryptoChainsTab = ({ selectedCurrency }: Props) => {
  const [sortBy, setSortBy] = useState<'profit' | 'steps'>('profit');
  const [minProfit, setMinProfit] = useState<number>(3.0);

  const chains = useMemo(() => {
    const predefinedChains: CryptoChain[] = [
      {
        chain: ['USDT', 'BTC', 'ETH', 'USDT'],
        exchanges: ['Binance', 'Bybit', 'OKX'],
        startAmount: 1000,
        endAmount: 1048,
        profit: 48,
        profitPercent: 4.8,
        steps: [
          { from: 'USDT', to: 'BTC', exchange: 'Binance', rate: 0.00001048, amount: 0.01048 },
          { from: 'BTC', to: 'ETH', exchange: 'Bybit', rate: 26.65, amount: 0.2793 },
          { from: 'ETH', to: 'USDT', exchange: 'OKX', rate: 3751, amount: 1048 }
        ]
      },
      {
        chain: ['USDT', 'SOL', 'BNB', 'USDT'],
        exchanges: ['KuCoin', 'Gate.io', 'Binance'],
        startAmount: 1000,
        endAmount: 1042,
        profit: 42,
        profitPercent: 4.2,
        steps: [
          { from: 'USDT', to: 'SOL', exchange: 'KuCoin', rate: 5.41, amount: 5.41 },
          { from: 'SOL', to: 'BNB', exchange: 'Gate.io', rate: 0.299, amount: 1.617 },
          { from: 'BNB', to: 'USDT', exchange: 'Binance', rate: 644.5, amount: 1042 }
        ]
      },
      {
        chain: ['BTC', 'USDT', 'XRP', 'BTC'],
        exchanges: ['HTX', 'Bybit', 'OKX'],
        startAmount: 1000,
        endAmount: 1038,
        profit: 38,
        profitPercent: 3.8,
        steps: [
          { from: 'BTC', to: 'USDT', exchange: 'HTX', rate: 101200, amount: 10.6 },
          { from: 'USDT', to: 'XRP', exchange: 'Bybit', rate: 425.5, amount: 4512 },
          { from: 'XRP', to: 'BTC', exchange: 'OKX', rate: 0.0000245, amount: 0.01085 }
        ]
      },
      {
        chain: ['ETH', 'DOGE', 'LTC', 'ETH'],
        exchanges: ['Binance', 'KuCoin', 'Gate.io'],
        startAmount: 1000,
        endAmount: 1036,
        profit: 36,
        profitPercent: 3.6,
        steps: [
          { from: 'ETH', to: 'DOGE', exchange: 'Binance', rate: 9421, amount: 2.63 },
          { from: 'DOGE', to: 'LTC', exchange: 'KuCoin', rate: 0.00388, amount: 10.2 },
          { from: 'LTC', to: 'ETH', exchange: 'Gate.io', rate: 0.0274, amount: 0.2894 }
        ]
      },
      {
        chain: ['USDT', 'ADA', 'DOT', 'USDT'],
        exchanges: ['Bybit', 'HTX', 'Binance'],
        startAmount: 1000,
        endAmount: 1034,
        profit: 34,
        profitPercent: 3.4,
        steps: [
          { from: 'USDT', to: 'ADA', exchange: 'Bybit', rate: 952, amount: 952 },
          { from: 'ADA', to: 'DOT', exchange: 'HTX', rate: 0.135, amount: 128.5 },
          { from: 'DOT', to: 'USDT', exchange: 'Binance', rate: 8.05, amount: 1034 }
        ]
      },
      {
        chain: ['BTC', 'ETH', 'USDT', 'BTC'],
        exchanges: ['OKX', 'Gate.io', 'Binance'],
        startAmount: 1000,
        endAmount: 1033,
        profit: 33,
        profitPercent: 3.3,
        steps: [
          { from: 'BTC', to: 'ETH', exchange: 'OKX', rate: 26.7, amount: 0.0105 },
          { from: 'ETH', to: 'USDT', exchange: 'Gate.io', rate: 3600, amount: 37.8 },
          { from: 'USDT', to: 'BTC', exchange: 'Binance', rate: 0.00001082, amount: 0.0108 }
        ]
      },
    ];

    return predefinedChains
      .filter(chain => chain.profitPercent >= minProfit)
      .sort((a, b) => sortBy === 'profit' ? b.profitPercent - a.profitPercent : a.chain.length - b.chain.length);
  }, [minProfit, sortBy]);

  const currencySymbol = selectedCurrency === 'RUB' ? '₽' : '$';
  const multiplier = selectedCurrency === 'RUB' ? 95 : 1;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/20">
          <CardContent className="pt-4 md:pt-6 px-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-purple-500/10 rounded-xl">
                <Icon name="GitBranch" size={20} className="text-purple-500 md:w-6 md:h-6" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Найдено связок</p>
                <p className="text-xl md:text-2xl font-bold">{chains.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-green-500/20">
          <CardContent className="pt-4 md:pt-6 px-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-green-500/10 rounded-xl">
                <Icon name="TrendingUp" size={20} className="text-green-500 md:w-6 md:h-6" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Лучшая прибыль</p>
                <p className="text-xl md:text-2xl font-bold text-green-500">
                  {chains.length > 0 ? chains[0].profitPercent.toFixed(2) : '0.00'}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20">
          <CardContent className="pt-4 md:pt-6 px-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-blue-500/10 rounded-xl">
                <Icon name="Zap" size={20} className="text-blue-500 md:w-6 md:h-6" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Средняя прибыль</p>
                <p className="text-xl md:text-2xl font-bold text-blue-500">
                  {chains.length > 0 
                    ? (chains.reduce((sum, c) => sum + c.profitPercent, 0) / chains.length).toFixed(2)
                    : '0.00'}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border">
        <CardHeader className="pb-3 md:pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Icon name="GitBranch" className="text-primary w-5 h-5 md:w-6 md:h-6" />
              <CardTitle className="text-base md:text-xl">Фильтры и сортировка</CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">Мин. прибыль:</span>
                <Select value={minProfit.toString()} onValueChange={(v) => setMinProfit(parseFloat(v))}>
                  <SelectTrigger className="w-[100px] md:w-[120px] h-8 md:h-10 text-xs md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3.0">3.0%</SelectItem>
                    <SelectItem value="5.0">5.0%</SelectItem>
                    <SelectItem value="7.0">7.0%</SelectItem>
                    <SelectItem value="10.0">10.0%</SelectItem>
                    <SelectItem value="15.0">15.0%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">Сортировка:</span>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className="w-[120px] md:w-[140px] h-8 md:h-10 text-xs md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profit">По прибыли</SelectItem>
                    <SelectItem value="steps">По шагам</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {chains.length === 0 ? (
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="py-12 md:py-16 text-center">
            <Icon name="SearchX" size={48} className="mx-auto text-muted-foreground mb-4 md:w-16 md:h-16" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Связок не найдено</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Попробуйте снизить минимальную прибыль в фильтрах
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:gap-4">
          {chains.map((chain, index) => (
            <Card 
              key={index} 
              className="bg-gradient-to-r from-card/80 via-card/50 to-card/80 backdrop-blur border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              <CardContent className="p-3 md:p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 text-primary font-bold text-sm md:text-base shrink-0">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {chain.chain.map((crypto, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/30 text-xs md:text-sm font-semibold px-2 md:px-3">
                                {crypto}
                              </Badge>
                              {i < chain.chain.length - 1 && (
                                <Icon name="ArrowRight" size={14} className="text-muted-foreground shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          {chain.exchanges.map((ex, i) => (
                            <span key={i} className="flex items-center gap-1">
                              <Icon name="Building2" size={12} className="text-primary" />
                              {ex}
                              {i < chain.exchanges.length - 1 && <span className="mx-1">→</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <Badge 
                        className={`text-sm md:text-lg font-bold px-3 py-1 ${
                          chain.profitPercent >= 10 
                            ? 'bg-green-500 text-white' 
                            : chain.profitPercent >= 5
                            ? 'bg-blue-500 text-white'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        +{chain.profitPercent.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 md:p-4 rounded-lg bg-muted/30 border border-border">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Старт</p>
                      <p className="text-sm md:text-base font-bold">
                        {currencySymbol}{(chain.startAmount * multiplier).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Финал</p>
                      <p className="text-sm md:text-base font-bold text-green-500">
                        {currencySymbol}{(chain.endAmount * multiplier).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Прибыль</p>
                      <p className="text-sm md:text-base font-bold text-primary">
                        +{currencySymbol}{(chain.profit * multiplier).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Шагов</p>
                      <p className="text-sm md:text-base font-bold">{chain.steps.length}</p>
                    </div>
                  </div>

                  <details className="group">
                    <summary className="flex items-center gap-2 cursor-pointer text-xs md:text-sm text-primary hover:underline">
                      <Icon name="ChevronDown" size={16} className="group-open:rotate-180 transition-transform" />
                      Подробные шаги обмена
                    </summary>
                    <div className="mt-3 space-y-2 pl-6">
                      {chain.steps.map((step, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs md:text-sm p-2 rounded bg-muted/20">
                          <Badge variant="outline" className="shrink-0">{i + 1}</Badge>
                          <span className="font-semibold">{step.from}</span>
                          <Icon name="ArrowRight" size={12} />
                          <span className="font-semibold">{step.to}</span>
                          <span className="text-muted-foreground">на {step.exchange}</span>
                          <span className="ml-auto font-mono text-primary">≈{step.amount.toFixed(4)} {step.to}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};