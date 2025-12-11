import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ChainGraph } from './ChainGraph';
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

const PROFITABLE_CHAINS: Omit<CryptoChain, 'startAmount' | 'endAmount' | 'profit'>[] = [
  { chain: ['BTC', 'ETH', 'USDT', 'BTC'], exchanges: ['Binance', 'Bybit', 'KuCoin'], profitPercent: 6.85, steps: [{from: 'BTC', to: 'ETH', exchange: 'Binance', rate: 26.65, amount: 26.65}, {from: 'ETH', to: 'USDT', exchange: 'Bybit', rate: 3598.5, amount: 95875}, {from: 'USDT', to: 'BTC', exchange: 'KuCoin', rate: 0.0000106, amount: 1.0685}] },
  { chain: ['ETH', 'BTC', 'SOL', 'ETH'], exchanges: ['OKX', 'Gate.io', 'Binance'], profitPercent: 5.42, steps: [{from: 'ETH', to: 'BTC', exchange: 'OKX', rate: 0.0375, amount: 0.0375}, {from: 'BTC', to: 'SOL', exchange: 'Gate.io', rate: 516.8, amount: 19.38}, {from: 'SOL', to: 'ETH', exchange: 'Binance', rate: 0.0517, amount: 1.0542}] },
  { chain: ['SOL', 'USDT', 'XRP', 'SOL'], exchanges: ['Bybit', 'HTX', 'OKX'], profitPercent: 4.73, steps: [{from: 'SOL', to: 'USDT', exchange: 'Bybit', rate: 186.2, amount: 186.2}, {from: 'USDT', to: 'XRP', exchange: 'HTX', rate: 0.425, amount: 79.21}, {from: 'XRP', to: 'SOL', exchange: 'OKX', rate: 0.0132, amount: 1.0473}] },
  { chain: ['BNB', 'ETH', 'BTC', 'BNB'], exchanges: ['Binance', 'KuCoin', 'Bybit'], profitPercent: 6.12, steps: [{from: 'BNB', to: 'ETH', exchange: 'Binance', rate: 0.173, amount: 0.173}, {from: 'ETH', to: 'BTC', exchange: 'KuCoin', rate: 0.0375, amount: 0.00649}, {from: 'BTC', to: 'BNB', exchange: 'Bybit', rate: 163.5, amount: 1.0612}] },
  { chain: ['XRP', 'DOGE', 'LTC', 'XRP'], exchanges: ['Gate.io', 'Binance', 'OKX'], profitPercent: 5.88, steps: [{from: 'XRP', to: 'DOGE', exchange: 'Gate.io', rate: 6.18, amount: 6.18}, {from: 'DOGE', to: 'LTC', exchange: 'Binance', rate: 0.00388, amount: 0.024}, {from: 'LTC', to: 'XRP', exchange: 'OKX', rate: 44.2, amount: 1.0588}] },
  { chain: ['USDT', 'BTC', 'ETH', 'USDT'], exchanges: ['Bybit', 'OKX', 'Gate.io'], profitPercent: 4.25, steps: [{from: 'USDT', to: 'BTC', exchange: 'Bybit', rate: 0.0000105, amount: 0.0000105}, {from: 'BTC', to: 'ETH', exchange: 'OKX', rate: 26.7, amount: 0.00028}, {from: 'ETH', to: 'USDT', exchange: 'Gate.io', rate: 3585, amount: 1.0425}] },
  { chain: ['ADA', 'SOL', 'MATIC', 'ADA'], exchanges: ['KuCoin', 'HTX', 'Binance'], profitPercent: 6.95, steps: [{from: 'ADA', to: 'SOL', exchange: 'KuCoin', rate: 0.00567, amount: 0.00567}, {from: 'SOL', to: 'MATIC', exchange: 'HTX', rate: 195.8, amount: 1.11}, {from: 'MATIC', to: 'ADA', exchange: 'Binance', rate: 0.96, amount: 1.0695}] },
  { chain: ['DOT', 'AVAX', 'BNB', 'DOT'], exchanges: ['Bybit', 'Binance', 'Gate.io'], profitPercent: 5.15, steps: [{from: 'DOT', to: 'AVAX', exchange: 'Bybit', rate: 0.186, amount: 0.186}, {from: 'AVAX', to: 'BNB', exchange: 'Binance', rate: 0.0677, amount: 0.0126}, {from: 'BNB', to: 'DOT', exchange: 'Gate.io', rate: 83.5, amount: 1.0515}] },
  { chain: ['LTC', 'DOGE', 'XRP', 'LTC'], exchanges: ['OKX', 'KuCoin', 'HTX'], profitPercent: 4.58, steps: [{from: 'LTC', to: 'DOGE', exchange: 'OKX', rate: 258, amount: 258}, {from: 'DOGE', to: 'XRP', exchange: 'KuCoin', rate: 0.162, amount: 41.8}, {from: 'XRP', to: 'LTC', exchange: 'HTX', rate: 0.0245, amount: 1.0458}] },
  { chain: ['MATIC', 'ADA', 'DOT', 'MATIC'], exchanges: ['Gate.io', 'Bybit', 'OKX'], profitPercent: 6.38, steps: [{from: 'MATIC', to: 'ADA', exchange: 'Gate.io', rate: 0.905, amount: 0.905}, {from: 'ADA', to: 'DOT', exchange: 'Bybit', rate: 0.135, amount: 0.122}, {from: 'DOT', to: 'MATIC', exchange: 'OKX', rate: 8.75, amount: 1.0638}] },
];

export const CryptoChainsTab = ({ selectedCurrency }: Props) => {
  const [sortBy, setSortBy] = useState<'profit' | 'steps'>('profit');
  const [minProfit, setMinProfit] = useState<number>(3.0);
  const [minProfitInput, setMinProfitInput] = useState<string>('3.0');

  const chains = useMemo(() => {
    const result: CryptoChain[] = PROFITABLE_CHAINS
      .filter(chain => chain.profitPercent >= minProfit)
      .map(chain => ({
        ...chain,
        startAmount: 1000,
        endAmount: 1000 * (1 + chain.profitPercent / 100),
        profit: 1000 * (chain.profitPercent / 100)
      }));
    
    return result
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
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={minProfitInput}
                  onChange={(e) => {
                    setMinProfitInput(e.target.value);
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0) {
                      setMinProfit(val);
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid grid-cols-2 gap-3 p-3 md:p-4 rounded-lg bg-muted/30 border border-border">
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
                    
                    <ChainGraph 
                      chain={chain.chain.slice(0, -1)} 
                      exchanges={chain.exchanges} 
                      profitPercent={chain.profitPercent} 
                    />
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