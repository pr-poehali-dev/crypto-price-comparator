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
    const result: CryptoChain[] = [];
    const cryptos = Object.keys(CRYPTO_PRICES) as Array<keyof typeof CRYPTO_PRICES>;
    
    for (let i = 0; i < cryptos.length; i++) {
      for (let j = 0; j < cryptos.length; j++) {
        for (let k = 0; k < cryptos.length; k++) {
          if (i !== j && j !== k && i !== k) {
            const c1 = cryptos[i];
            const c2 = cryptos[j];
            const c3 = cryptos[k];
            
            const ex1 = EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)];
            const ex2 = EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)];
            const ex3 = EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)];
            
            const fee1 = 0.001 + Math.random() * 0.003;
            const fee2 = 0.001 + Math.random() * 0.003;
            const fee3 = 0.001 + Math.random() * 0.003;
            
            const slippage = 0.995 + Math.random() * 0.008;
            
            const rate1 = (CRYPTO_PRICES[c1] / CRYPTO_PRICES[c2]) * (1 - fee1) * slippage;
            const rate2 = (CRYPTO_PRICES[c2] / CRYPTO_PRICES[c3]) * (1 - fee2) * slippage;
            const rate3 = (CRYPTO_PRICES[c3] / CRYPTO_PRICES[c1]) * (1 - fee3) * slippage;
            
            const startAmount = 1000;
            const amount1 = startAmount / CRYPTO_PRICES[c1];
            const amount2 = amount1 * rate1;
            const amount3 = amount2 * rate2;
            const endAmount = amount3 * rate3 * CRYPTO_PRICES[c1];
            
            const profitPercent = ((endAmount - startAmount) / startAmount) * 100;
            
            if (profitPercent >= minProfit) {
              result.push({
                chain: [c1, c2, c3, c1],
                exchanges: [ex1, ex2, ex3],
                startAmount,
                endAmount,
                profit: endAmount - startAmount,
                profitPercent,
                steps: [
                  { from: c1, to: c2, exchange: ex1, rate: rate1, amount: amount2 },
                  { from: c2, to: c3, exchange: ex2, rate: rate2, amount: amount3 },
                  { from: c3, to: c1, exchange: ex3, rate: rate3, amount: amount3 * rate3 }
                ]
              });
            }
          }
        }
      }
    }
    
    return result
      .sort((a, b) => sortBy === 'profit' ? b.profitPercent - a.profitPercent : a.chain.length - b.chain.length)
      .slice(0, 20);
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
