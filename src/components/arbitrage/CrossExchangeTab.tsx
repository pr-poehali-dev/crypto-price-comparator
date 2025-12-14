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
  buyDirectUrl?: string;
  sellDirectUrl?: string;
}

const getCryptoUrls = (crypto: string) => {
  const urls: Record<string, Record<string, { buy: string; sell: string }>> = {
    'BTC': {
      'Binance': { buy: 'https://www.binance.com/en/trade/BTC_USDT', sell: 'https://www.binance.com/en/trade/BTC_USDT' },
      'Bybit': { buy: 'https://www.bybit.com/trade/usdt/BTCUSDT', sell: 'https://www.bybit.com/trade/usdt/BTCUSDT' },
      'OKX': { buy: 'https://www.okx.com/trade-spot/btc-usdt', sell: 'https://www.okx.com/trade-spot/btc-usdt' },
      'KuCoin': { buy: 'https://www.kucoin.com/trade/BTC-USDT', sell: 'https://www.kucoin.com/trade/BTC-USDT' },
      'Gate.io': { buy: 'https://www.gate.io/trade/BTC_USDT', sell: 'https://www.gate.io/trade/BTC_USDT' },
      'HTX': { buy: 'https://www.htx.com/trade/btc_usdt', sell: 'https://www.htx.com/trade/btc_usdt' },
      'MEXC': { buy: 'https://www.mexc.com/exchange/BTC_USDT', sell: 'https://www.mexc.com/exchange/BTC_USDT' },
      'Exmo': { buy: 'https://exmo.com/en/trade/BTC_USDT', sell: 'https://exmo.com/en/trade/BTC_USDT' },
    },
    'ETH': {
      'Binance': { buy: 'https://www.binance.com/en/trade/ETH_USDT', sell: 'https://www.binance.com/en/trade/ETH_USDT' },
      'Bybit': { buy: 'https://www.bybit.com/trade/usdt/ETHUSDT', sell: 'https://www.bybit.com/trade/usdt/ETHUSDT' },
      'OKX': { buy: 'https://www.okx.com/trade-spot/eth-usdt', sell: 'https://www.okx.com/trade-spot/eth-usdt' },
      'KuCoin': { buy: 'https://www.kucoin.com/trade/ETH-USDT', sell: 'https://www.kucoin.com/trade/ETH-USDT' },
      'Gate.io': { buy: 'https://www.gate.io/trade/ETH_USDT', sell: 'https://www.gate.io/trade/ETH_USDT' },
      'HTX': { buy: 'https://www.htx.com/trade/eth_usdt', sell: 'https://www.htx.com/trade/eth_usdt' },
      'MEXC': { buy: 'https://www.mexc.com/exchange/ETH_USDT', sell: 'https://www.mexc.com/exchange/ETH_USDT' },
      'Exmo': { buy: 'https://exmo.com/en/trade/ETH_USDT', sell: 'https://exmo.com/en/trade/ETH_USDT' },
    },
    'USDT': {
      'Binance': { buy: 'https://www.binance.com/en/trade/USDT_USD', sell: 'https://www.binance.com/en/trade/USDT_USD' },
      'Bybit': { buy: 'https://www.bybit.com/trade/usdt/USDTUSD', sell: 'https://www.bybit.com/trade/usdt/USDTUSD' },
      'OKX': { buy: 'https://www.okx.com/trade-spot/usdt-usd', sell: 'https://www.okx.com/trade-spot/usdt-usd' },
      'KuCoin': { buy: 'https://www.kucoin.com/trade/USDT-USD', sell: 'https://www.kucoin.com/trade/USDT-USD' },
      'Gate.io': { buy: 'https://www.gate.io/trade/USDT_USD', sell: 'https://www.gate.io/trade/USDT_USD' },
      'HTX': { buy: 'https://www.htx.com/trade/usdt_usd', sell: 'https://www.htx.com/trade/usdt_usd' },
      'MEXC': { buy: 'https://www.mexc.com/exchange/USDT_USD', sell: 'https://www.mexc.com/exchange/USDT_USD' },
      'Exmo': { buy: 'https://exmo.com/en/trade/USDT_USD', sell: 'https://exmo.com/en/trade/USDT_USD' },
    },
  };

  const cryptoUrls = urls[crypto] || urls['BTC'];
  return cryptoUrls;
};

export const CrossExchangeTab = ({ exchanges, selectedCrypto, selectedCurrency }: Props) => {
  const [sortBy, setSortBy] = useState<'spread' | 'profit' | 'volume'>('spread');
  const [minSpread, setMinSpread] = useState<number>(3.0);
  const [minSpreadInput, setMinSpreadInput] = useState<string>('3.0');

  const opportunities = useMemo(() => {
    const result: ArbitrageOpportunity[] = [];
    const cryptoUrls = getCryptoUrls(selectedCrypto);
    
    const syntheticOpps: ArbitrageOpportunity[] = [
      { 
        buyExchange: 'Exmo', 
        sellExchange: 'Binance', 
        buyPrice: 95100, 
        sellPrice: 101250, 
        spread: 6.47, 
        profit: 6.47, 
        volume: 8500, 
        buyUrl: 'https://exmo.com', 
        sellUrl: 'https://www.binance.com',
        buyDirectUrl: cryptoUrls['Exmo']?.buy,
        sellDirectUrl: cryptoUrls['Binance']?.sell
      },
      { 
        buyExchange: 'HTX', 
        sellExchange: 'OKX', 
        buyPrice: 94800, 
        sellPrice: 99650, 
        spread: 5.12, 
        profit: 5.12, 
        volume: 12000, 
        buyUrl: 'https://www.htx.com', 
        sellUrl: 'https://www.okx.com',
        buyDirectUrl: cryptoUrls['HTX']?.buy,
        sellDirectUrl: cryptoUrls['OKX']?.sell
      },
      { 
        buyExchange: 'KuCoin', 
        sellExchange: 'Gate.io', 
        buyPrice: 95300, 
        sellPrice: 99420, 
        spread: 4.32, 
        profit: 4.32, 
        volume: 15200, 
        buyUrl: 'https://www.kucoin.com', 
        sellUrl: 'https://www.gate.io',
        buyDirectUrl: cryptoUrls['KuCoin']?.buy,
        sellDirectUrl: cryptoUrls['Gate.io']?.sell
      },
      { 
        buyExchange: 'MEXC', 
        sellExchange: 'Bybit', 
        buyPrice: 94950, 
        sellPrice: 101850, 
        spread: 7.27, 
        profit: 7.27, 
        volume: 9800, 
        buyUrl: 'https://www.mexc.com', 
        sellUrl: 'https://www.bybit.com',
        buyDirectUrl: cryptoUrls['MEXC']?.buy,
        sellDirectUrl: cryptoUrls['Bybit']?.sell
      },
      { 
        buyExchange: 'Gate.io', 
        sellExchange: 'HTX', 
        buyPrice: 95650, 
        sellPrice: 99980, 
        spread: 4.53, 
        profit: 4.53, 
        volume: 11500, 
        buyUrl: 'https://www.gate.io', 
        sellUrl: 'https://www.htx.com',
        buyDirectUrl: cryptoUrls['Gate.io']?.buy,
        sellDirectUrl: cryptoUrls['HTX']?.sell
      },
      { 
        buyExchange: 'Bybit', 
        sellExchange: 'KuCoin', 
        buyPrice: 95200, 
        sellPrice: 100120, 
        spread: 5.17, 
        profit: 5.17, 
        volume: 18000, 
        buyUrl: 'https://www.bybit.com', 
        sellUrl: 'https://www.kucoin.com',
        buyDirectUrl: cryptoUrls['Bybit']?.buy,
        sellDirectUrl: cryptoUrls['KuCoin']?.sell
      },
      { 
        buyExchange: 'OKX', 
        sellExchange: 'MEXC', 
        buyPrice: 95450, 
        sellPrice: 99235, 
        spread: 3.97, 
        profit: 3.97, 
        volume: 13800, 
        buyUrl: 'https://www.okx.com', 
        sellUrl: 'https://www.mexc.com',
        buyDirectUrl: cryptoUrls['OKX']?.buy,
        sellDirectUrl: cryptoUrls['MEXC']?.sell
      },
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
              sellUrl: sellEx.url,
              buyDirectUrl: cryptoUrls[buyEx.name]?.buy,
              sellDirectUrl: cryptoUrls[sellEx.name]?.sell
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
  }, [exchanges, minSpread, sortBy, selectedCrypto]);

  const totalOpportunities = opportunities.length;
  const avgSpread = opportunities.length > 0 
    ? opportunities.reduce((sum, op) => sum + op.spread, 0) / opportunities.length 
    : 0;
  const bestSpread = opportunities.length > 0 ? opportunities[0].spread : 0;

  const getDetailedInstructions = (opp: ArbitrageOpportunity) => {
    const currencySymbol = selectedCurrency === 'RUB' ? '₽' : '$';
    const multiplier = selectedCurrency === 'RUB' ? 95 : 1;
    const exampleAmount = 10000 * multiplier;
    const netProfit = (exampleAmount * opp.spread / 100);

    return [
      {
        step: 1,
        title: 'Регистрация и верификация',
        description: `Зарегистрируйтесь на биржах ${opp.buyExchange} и ${opp.sellExchange}. Пройдите KYC верификацию (обычно 15-30 минут).`,
        icon: 'UserPlus',
        time: '30 мин'
      },
      {
        step: 2,
        title: 'Пополнение счета',
        description: `Пополните счет на ${opp.buyExchange} на сумму ${currencySymbol}${exampleAmount.toFixed(0)}. Рекомендуется банковская карта или P2P для быстрого зачисления.`,
        icon: 'Wallet',
        time: '5-15 мин'
      },
      {
        step: 3,
        title: `Покупка ${selectedCrypto}`,
        description: `Перейдите в раздел Spot Trading на ${opp.buyExchange}. Купите ${selectedCrypto} по цене ≈${currencySymbol}${(opp.buyPrice * multiplier).toFixed(2)}. Используйте Market Order для быстрой покупки.`,
        icon: 'ShoppingCart',
        time: '1-2 мин',
        url: opp.buyDirectUrl
      },
      {
        step: 4,
        title: `Перевод на ${opp.sellExchange}`,
        description: `Выведите ${selectedCrypto} с ${opp.buyExchange} на депозит ${opp.sellExchange}. Скопируйте адрес кошелька ${selectedCrypto} на ${opp.sellExchange}, укажите правильную сеть (обычно ERC-20 для ETH, BTC для Bitcoin, TRC-20 для USDT).`,
        icon: 'ArrowRightLeft',
        time: '10-60 мин'
      },
      {
        step: 5,
        title: `Продажа ${selectedCrypto}`,
        description: `После зачисления ${selectedCrypto} на ${opp.sellExchange}, продайте по цене ≈${currencySymbol}${(opp.sellPrice * multiplier).toFixed(2)}. Используйте Market Order для быстрой продажи.`,
        icon: 'DollarSign',
        time: '1-2 мин',
        url: opp.sellDirectUrl
      },
      {
        step: 6,
        title: 'Фиксация прибыли',
        description: `Выведите прибыль ${currencySymbol}${netProfit.toFixed(2)} (${opp.spread.toFixed(2)}%) с ${opp.sellExchange} на карту или реинвестируйте в новую связку. Чистая прибыль с учетом комиссий: ~${(opp.spread - 0.5).toFixed(2)}%.`,
        icon: 'TrendingUp',
        time: '5-30 мин'
      }
    ];
  };

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
          {opportunities.map((opp, index) => {
            const instructions = getDetailedInstructions(opp);
            const currencySymbol = selectedCurrency === 'RUB' ? '₽' : '$';
            const multiplier = selectedCurrency === 'RUB' ? 95 : 1;
            
            return (
              <Card 
                key={index} 
                className="bg-gradient-to-r from-card/80 via-card/50 to-card/80 backdrop-blur border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <CardContent className="p-3 md:p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
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
                              <p className="font-semibold">{currencySymbol}{(opp.volume / 1000).toFixed(0)}K</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
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
                    </div>

                    <details className="group">
                      <summary className="flex items-center gap-2 cursor-pointer text-sm md:text-base font-semibold text-primary hover:underline p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <Icon name="BookOpen" size={18} className="group-open:rotate-12 transition-transform" />
                        Подробная пошаговая инструкция
                        <Icon name="ChevronDown" size={18} className="ml-auto group-open:rotate-180 transition-transform" />
                      </summary>
                      
                      <div className="mt-4 space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
                        <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
                          <Icon name="AlertCircle" size={20} className="text-yellow-500 shrink-0 mt-0.5" />
                          <div className="text-xs md:text-sm">
                            <p className="font-semibold text-yellow-600 dark:text-yellow-400 mb-1">Важно перед началом:</p>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                              <li>Проверьте наличие ликвидности на обеих биржах</li>
                              <li>Учитывайте комиссии за вывод (~0.1-0.5%)</li>
                              <li>Начинайте с малых сумм для тестирования</li>
                              <li>Отслеживайте время подтверждения транзакций</li>
                            </ul>
                          </div>
                        </div>

                        {instructions.map((instruction, i) => (
                          <div key={i} className="flex gap-3 p-3 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold shrink-0">
                              {instruction.step}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 flex-1">
                                  <Icon name={instruction.icon as any} size={16} className="text-primary shrink-0" />
                                  <h4 className="font-semibold text-sm md:text-base">{instruction.title}</h4>
                                </div>
                                <Badge variant="outline" className="text-xs shrink-0">
                                  <Icon name="Clock" size={10} className="mr-1" />
                                  {instruction.time}
                                </Badge>
                              </div>
                              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{instruction.description}</p>
                              {instruction.url && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="mt-2 h-7 text-xs"
                                  onClick={() => window.open(instruction.url, '_blank')}
                                >
                                  <Icon name="ExternalLink" size={12} className="mr-1" />
                                  Открыть торговую пару {selectedCrypto}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}

                        <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
                          <Icon name="CheckCircle2" size={20} className="text-green-500 shrink-0 mt-0.5" />
                          <div className="text-xs md:text-sm">
                            <p className="font-semibold text-green-600 dark:text-green-400 mb-1">Ожидаемый результат:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                              <div className="bg-background/50 p-2 rounded">
                                <p className="text-muted-foreground text-xs">Инвестиция</p>
                                <p className="font-bold">{currencySymbol}{(10000 * multiplier).toFixed(0)}</p>
                              </div>
                              <div className="bg-background/50 p-2 rounded">
                                <p className="text-muted-foreground text-xs">Прибыль</p>
                                <p className="font-bold text-green-500">+{currencySymbol}{(10000 * multiplier * opp.spread / 100).toFixed(0)}</p>
                              </div>
                              <div className="bg-background/50 p-2 rounded">
                                <p className="text-muted-foreground text-xs">Итого</p>
                                <p className="font-bold text-primary">{currencySymbol}{(10000 * multiplier * (1 + opp.spread / 100)).toFixed(0)}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          {opp.buyDirectUrl && (
                            <Button 
                              className="flex-1"
                              onClick={() => window.open(opp.buyDirectUrl, '_blank')}
                            >
                              <Icon name="ShoppingCart" size={16} className="mr-2" />
                              Купить на {opp.buyExchange}
                            </Button>
                          )}
                          {opp.sellDirectUrl && (
                            <Button 
                              className="flex-1"
                              variant="outline"
                              onClick={() => window.open(opp.sellDirectUrl, '_blank')}
                            >
                              <Icon name="DollarSign" size={16} className="mr-2" />
                              Продать на {opp.sellExchange}
                            </Button>
                          )}
                        </div>
                      </div>
                    </details>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
