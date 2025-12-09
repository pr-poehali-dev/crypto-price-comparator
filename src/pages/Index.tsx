import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { ArbitrageTab } from '@/components/arbitrage/ArbitrageTab';
import { CalculatorTab } from '@/components/arbitrage/CalculatorTab';
import { AnalyticsTab } from '@/components/arbitrage/AnalyticsTab';
import { AIPredictionTab } from '@/components/arbitrage/AIPredictionTab';

interface Exchange {
  name: string;
  price: number;
  volume: number;
  fee: number;
  change24h: number;
  url?: string;
  dataSource?: string;
}

const Index = () => {
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>('1');
  const [selectedCrypto, setSelectedCrypto] = useState<string>('BTC');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [minProfitThreshold, setMinProfitThreshold] = useState<string>('0.3');
  const [minProfitFilter, setMinProfitFilter] = useState<string>('3.0');
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);
  const [exchanges, setExchanges] = useState<Exchange[]>([
    { name: 'Binance', price: 95420, volume: 24.5, fee: 0.1, change24h: 2.34 },
    { name: 'Coinbase', price: 95680, volume: 18.2, fee: 0.5, change24h: 2.41 },
    { name: 'Kraken', price: 95350, volume: 12.8, fee: 0.26, change24h: 2.28 },
    { name: 'Bybit', price: 95580, volume: 21.3, fee: 0.1, change24h: 2.38 },
    { name: 'OKX', price: 95290, volume: 19.7, fee: 0.08, change24h: 2.25 },
    { name: 'Bitfinex', price: 95750, volume: 8.9, fee: 0.2, change24h: 2.45 },
  ]);

  const [priceHistory] = useState([
    { time: '00:00', spread: 120, profit: 0.12 },
    { time: '04:00', spread: 180, profit: 0.18 },
    { time: '08:00', spread: 250, profit: 0.26 },
    { time: '12:00', spread: 320, profit: 0.33 },
    { time: '16:00', spread: 280, profit: 0.29 },
    { time: '20:00', spread: 460, profit: 0.48 },
  ]);

  const [aiPrediction] = useState([
    { time: 'Сейчас', value: 95420 },
    { time: '+1ч', value: 95680 },
    { time: '+2ч', value: 95920 },
    { time: '+4ч', value: 96180 },
    { time: '+8ч', value: 95950 },
    { time: '+12ч', value: 96420 },
  ]);

  useEffect(() => {
    const fetchRealPrices = async () => {
      try {
        const response = await fetch(`https://functions.poehali.dev/ac977fcc-5718-4e2b-b050-2421e770d97e?crypto=${selectedCrypto}`);
        if (response.ok) {
          const data = await response.json();
          if (data.exchanges && data.exchanges.length > 0) {
            setExchanges(data.exchanges);
          }
        }
      } catch (error) {
        console.log('Using demo data:', error);
      }
    };

    fetchRealPrices();
    const priceInterval = setInterval(fetchRealPrices, 60000);

    return () => {
      clearInterval(priceInterval);
    };
  }, [selectedCrypto]);

  useEffect(() => {
    if (!notificationsEnabled) return;

    const now = Date.now();
    if (now - lastNotificationTime < 60000) return;

    const sortedExchanges = [...exchanges].sort((a, b) => a.price - b.price);
    const minPrice = sortedExchanges[0];
    const maxPrice = sortedExchanges[sortedExchanges.length - 1];
    const spread = maxPrice.price - minPrice.price;
    const profitPercent = ((spread / minPrice.price) * 100);

    const threshold = parseFloat(minProfitThreshold) || 0.3;

    if (profitPercent >= threshold) {
      toast({
        title: "🚀 Выгодная возможность!",
        description: `Спред ${profitPercent.toFixed(2)}% между ${minPrice.name} и ${maxPrice.name}. Потенциальная прибыль: $${spread.toFixed(2)}`,
        duration: 5000,
      });
      setLastNotificationTime(now);
    }
  }, [exchanges, notificationsEnabled, minProfitThreshold, lastNotificationTime, toast]);

  return (
    <div className="min-h-screen bg-background p-3 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground flex items-center gap-2 md:gap-3">
              <Icon name="TrendingUp" size={28} className="text-primary md:w-9 md:h-9" />
              CryptoArbitrage Pro
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Мониторинг арбитражных возможностей в реальном времени</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="animate-pulse-glow">
              <Badge variant="outline" className="text-primary border-primary text-xs md:text-sm">
                <Icon name="Radio" size={12} className="mr-1" />
                LIVE
              </Badge>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardContent className="pt-4 md:pt-6 px-4 pb-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                <Icon name="Coins" size={20} className="text-primary hidden md:block" />
                <div className="flex-1">
                  <Label htmlFor="crypto" className="text-sm md:text-base font-semibold">Криптовалюта</Label>
                  <p className="text-xs md:text-sm text-muted-foreground">Выберите монету для мониторинга</p>
                </div>
                <select
                  id="crypto"
                  value={selectedCrypto}
                  onChange={(e) => setSelectedCrypto(e.target.value)}
                  className="w-full md:w-auto px-3 md:px-4 py-2 bg-background border border-border rounded-md font-semibold text-sm md:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="SOL">Solana (SOL)</option>
                  <option value="XRP">Ripple (XRP)</option>
                  <option value="BNB">Binance Coin (BNB)</option>
                  <option value="ADA">Cardano (ADA)</option>
                  <option value="DOGE">Dogecoin (DOGE)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border">
            <CardContent className="pt-4 md:pt-6 px-4 pb-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon name="Bell" size={20} className="text-primary hidden md:block" />
                    <div>
                      <Label htmlFor="notifications" className="text-sm md:text-base font-semibold">Уведомления</Label>
                      <p className="text-xs md:text-sm text-muted-foreground hidden md:block">Получайте алерты при выгодных спредах</p>
                    </div>
                  </div>
                  <Switch
                    id="notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
                {notificationsEnabled && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="threshold" className="text-xs md:text-sm whitespace-nowrap">Мин. прибыль:</Label>
                    <Input
                      id="threshold"
                      type="number"
                      step="0.1"
                      value={minProfitThreshold}
                      onChange={(e) => setMinProfitThreshold(e.target.value)}
                      className="w-16 md:w-20 text-sm"
                      inputMode="decimal"
                    />
                    <span className="text-xs md:text-sm text-muted-foreground">%</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="arbitrage" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4 md:mb-6 h-auto">
            <TabsTrigger value="arbitrage" className="flex-col md:flex-row gap-1 md:gap-2 py-2 md:py-2.5 text-xs md:text-sm">
              <Icon name="ArrowLeftRight" size={14} className="md:mr-0" />
              <span className="hidden md:inline">Арбитраж</span>
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex-col md:flex-row gap-1 md:gap-2 py-2 md:py-2.5 text-xs md:text-sm">
              <Icon name="Calculator" size={14} className="md:mr-0" />
              <span className="hidden md:inline">Калькулятор</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex-col md:flex-row gap-1 md:gap-2 py-2 md:py-2.5 text-xs md:text-sm">
              <Icon name="LineChart" size={14} className="md:mr-0" />
              <span className="hidden md:inline">Аналитика</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex-col md:flex-row gap-1 md:gap-2 py-2 md:py-2.5 text-xs md:text-sm">
              <Icon name="Brain" size={14} className="md:mr-0" />
              <span className="hidden md:inline">AI Прогноз</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="arbitrage" className="space-y-4 md:space-y-6">
            <Card className="bg-card/50 backdrop-blur border-border">
              <CardContent className="pt-4 md:pt-6 px-4 pb-4">
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                  <Icon name="Filter" size={20} className="text-accent hidden md:block" />
                  <div className="flex-1">
                    <Label htmlFor="profitFilter" className="text-sm md:text-base font-semibold">Фильтр возможностей</Label>
                    <p className="text-xs md:text-sm text-muted-foreground">Показать площадки с выгодой от</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="profitFilter"
                      type="number"
                      step="0.5"
                      min="0"
                      max="20"
                      value={minProfitFilter}
                      onChange={(e) => setMinProfitFilter(e.target.value)}
                      className="w-20 md:w-24 text-sm md:text-base"
                      inputMode="decimal"
                    />
                    <span className="text-sm md:text-base font-medium">%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <ArbitrageTab exchanges={exchanges} selectedCrypto={selectedCrypto} minProfitFilter={parseFloat(minProfitFilter) || 3.0} />
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <CalculatorTab 
              exchanges={exchanges} 
              selectedCrypto={selectedCrypto}
              amount={amount}
              setAmount={setAmount}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab priceHistory={priceHistory} />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <AIPredictionTab aiPrediction={aiPrediction} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;