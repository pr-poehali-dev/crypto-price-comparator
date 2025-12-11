import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { ArbitrageTab } from '@/components/arbitrage/ArbitrageTab';
import { NoCardsTab } from '@/components/arbitrage/NoCardsTab';
import { CalculatorTab } from '@/components/arbitrage/CalculatorTab';
import { AnalyticsTab } from '@/components/arbitrage/AnalyticsTab';
import { AIPredictionTab } from '@/components/arbitrage/AIPredictionTab';
import { VerifiedSchemesTab } from '@/components/arbitrage/VerifiedSchemesTab';
import { SpreadVisualization } from '@/components/arbitrage/SpreadVisualization';
import { BestSchemeCard } from '@/components/arbitrage/BestSchemeCard';
import { ProfitCalculator } from '@/components/arbitrage/ProfitCalculator';
import { ProfitVisualization } from '@/components/arbitrage/ProfitVisualization';
import { TradingHistory } from '@/components/arbitrage/TradingHistory';
import { LoginPage } from '@/components/auth/LoginPage';
import { initSession } from '@/lib/analytics';
import { startCronScheduler } from '@/lib/cronScheduler';

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('1');
  const [selectedCrypto, setSelectedCrypto] = useState<string>('BTC');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [minProfitThreshold, setMinProfitThreshold] = useState<string>('0.3');
  const [minProfitFilter, setMinProfitFilter] = useState<string>('0.1');
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState<boolean>(true);

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
    initSession();
    startCronScheduler();
    
    const auth = localStorage.getItem('platformAuth');
    if (auth) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const fetchRealPrices = async () => {
      setIsLoadingPrices(true);
      try {
        const response = await fetch(`https://functions.poehali.dev/ac977fcc-5718-4e2b-b050-2421e770d97e?crypto=${selectedCrypto}`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.exchanges && data.exchanges.length > 0) {
            setExchanges(data.exchanges);
            console.log(`✅ Загружено ${data.exchanges.length} бирж для ${selectedCrypto}`);
          }
        } else {
          console.error('API response error:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch prices:', error);
      } finally {
        setIsLoadingPrices(false);
      }
    };

    fetchRealPrices();
    const priceInterval = setInterval(fetchRealPrices, 60000);

    return () => {
      clearInterval(priceInterval);
    };
  }, [selectedCrypto]);

  useEffect(() => {
    if (!notificationsEnabled || exchanges.length === 0) return;

    const now = Date.now();
    if (now - lastNotificationTime < 60000) return;

    const sortedExchanges = [...exchanges].sort((a, b) => a.price - b.price);
    
    const topSpreads = sortedExchanges.slice(0, 3).map((lowExchange) => {
      const highExchanges = sortedExchanges.slice(-2);
      return highExchanges.map((highExchange) => {
        const spreadValue = highExchange.price - lowExchange.price;
        const netProfit = spreadValue - (lowExchange.price * lowExchange.fee / 100) - (highExchange.price * highExchange.fee / 100);
        const netProfitPct = (netProfit / lowExchange.price) * 100;

        return {
          buyFrom: lowExchange.name,
          sellTo: highExchange.name,
          netProfit,
          netProfitPercent: netProfitPct,
        };
      });
    }).flat().sort((a, b) => b.netProfitPercent - a.netProfitPercent)[0];

    const threshold = parseFloat(minProfitThreshold) || 0.3;

    if (topSpreads && topSpreads.netProfitPercent >= threshold) {
      toast({
        title: "🎯 Лучшая схема найдена!",
        description: `${topSpreads.buyFrom} → ${topSpreads.sellTo}: ${topSpreads.netProfitPercent.toFixed(2)}% чистой прибыли ($${topSpreads.netProfit.toFixed(2)})`,
        duration: 7000,
      });
      setLastNotificationTime(now);
    }
  }, [exchanges, notificationsEnabled, minProfitThreshold, lastNotificationTime, toast]);

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

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
          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                localStorage.removeItem('platformAuth');
                setIsAuthenticated(false);
                toast({ title: 'Вы вышли из аккаунта' });
              }}
            >
              <Icon name="LogOut" size={16} className="mr-2" />
              Выход
            </Button>
            <Link to="/login">
              <Button variant="outline" size="sm">
                <Icon name="Settings" size={16} className="mr-2" />
                Админ
              </Button>
            </Link>
            {isLoadingPrices ? (
              <Badge variant="outline" className="text-accent border-accent text-xs md:text-sm">
                <Icon name="RefreshCw" size={12} className="mr-1 animate-spin" />
                Обновление...
              </Badge>
            ) : (
              <div className="animate-pulse-glow">
                <Badge variant="outline" className="text-primary border-primary text-xs md:text-sm">
                  <Icon name="Radio" size={12} className="mr-1" />
                  LIVE
                </Badge>
              </div>
            )}
          </div>
        </header>

        <BestSchemeCard exchanges={exchanges} selectedCrypto={selectedCrypto} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProfitCalculator exchanges={exchanges} selectedCrypto={selectedCrypto} />
          <ProfitVisualization exchanges={exchanges} investmentAmount={1000} />
        </div>

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
                  <option value="AVAX">Avalanche (AVAX)</option>
                  <option value="DOT">Polkadot (DOT)</option>
                  <option value="MATIC">Polygon (MATIC)</option>
                  <option value="LINK">Chainlink (LINK)</option>
                  <option value="UNI">Uniswap (UNI)</option>
                  <option value="LTC">Litecoin (LTC)</option>
                  <option value="TRX">Tron (TRX)</option>
                  <option value="ATOM">Cosmos (ATOM)</option>
                  <option value="XLM">Stellar (XLM)</option>
                  <option value="ETC">Ethereum Classic (ETC)</option>
                  <option value="FIL">Filecoin (FIL)</option>
                  <option value="SHIB">Shiba Inu (SHIB)</option>
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
                      <Label htmlFor="notifications" className="text-sm md:text-base font-semibold">Автопоиск схем</Label>
                      <p className="text-xs md:text-sm text-muted-foreground hidden md:block">Автоматический поиск лучших арбитражных схем</p>
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

        <TradingHistory />

        <Tabs defaultValue="arbitrage" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-4 md:mb-6 h-auto">
            <TabsTrigger value="arbitrage" className="flex-col md:flex-row gap-1 md:gap-2 py-2 md:py-2.5 text-xs md:text-sm">
              <Icon name="ArrowLeftRight" size={14} className="md:mr-0" />
              <span className="hidden md:inline">Арбитраж</span>
            </TabsTrigger>
            <TabsTrigger value="verified" className="flex-col md:flex-row gap-1 md:gap-2 py-2 md:py-2.5 text-xs md:text-sm">
              <Icon name="CheckCircle2" size={14} className="md:mr-0" />
              <span className="hidden md:inline">Проверенные</span>
            </TabsTrigger>
            <TabsTrigger value="no-cards" className="flex-col md:flex-row gap-1 md:gap-2 py-2 md:py-2.5 text-xs md:text-sm">
              <Icon name="Wallet" size={14} className="md:mr-0" />
              <span className="hidden md:inline">Без карт</span>
            </TabsTrigger>
            <TabsTrigger value="spreads" className="flex-col md:flex-row gap-1 md:gap-2 py-2 md:py-2.5 text-xs md:text-sm">
              <Icon name="BarChart3" size={14} className="md:mr-0" />
              <span className="hidden md:inline">Схемы</span>
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

          <TabsContent value="verified" className="space-y-6">
            <VerifiedSchemesTab exchanges={exchanges} selectedCrypto={selectedCrypto} />
          </TabsContent>

          <TabsContent value="no-cards" className="space-y-6">
            <NoCardsTab exchanges={exchanges} selectedCrypto={selectedCrypto} />
          </TabsContent>

          <TabsContent value="spreads" className="space-y-6">
            <SpreadVisualization exchanges={exchanges} selectedCrypto={selectedCrypto} />
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
            <AIPredictionTab 
              aiPrediction={aiPrediction} 
              exchanges={exchanges}
              selectedCrypto={selectedCrypto}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;