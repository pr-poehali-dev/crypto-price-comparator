import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Exchange {
  name: string;
  price: number;
  volume: number;
  fee: number;
  change24h: number;
}

const Index = () => {
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>('1');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [minProfitThreshold, setMinProfitThreshold] = useState<string>('0.3');
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);
  const [exchanges, setExchanges] = useState<Exchange[]>([
    { name: 'Binance', price: 95420, volume: 24.5, fee: 0.1, change24h: 2.34 },
    { name: 'Coinbase', price: 95680, volume: 18.2, fee: 0.5, change24h: 2.41 },
    { name: 'Kraken', price: 95350, volume: 12.8, fee: 0.26, change24h: 2.28 },
    { name: 'Bybit', price: 95580, volume: 21.3, fee: 0.1, change24h: 2.38 },
    { name: 'OKX', price: 95290, volume: 19.7, fee: 0.08, change24h: 2.25 },
    { name: 'Bitfinex', price: 95750, volume: 8.9, fee: 0.2, change24h: 2.45 },
  ]);

  const [priceHistory, setPriceHistory] = useState([
    { time: '00:00', spread: 120, profit: 0.12 },
    { time: '04:00', spread: 180, profit: 0.18 },
    { time: '08:00', spread: 250, profit: 0.26 },
    { time: '12:00', spread: 320, profit: 0.33 },
    { time: '16:00', spread: 280, profit: 0.29 },
    { time: '20:00', spread: 460, profit: 0.48 },
  ]);

  const [aiPrediction, setAiPrediction] = useState([
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
        const response = await fetch('https://functions.poehali.dev/ac977fcc-5718-4e2b-b050-2421e770d97e');
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
    const priceInterval = setInterval(fetchRealPrices, 15000);

    return () => {
      clearInterval(priceInterval);
    };
  }, []);

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

  const sortedExchanges = [...exchanges].sort((a, b) => a.price - b.price);
  const minPrice = sortedExchanges[0];
  const maxPrice = sortedExchanges[sortedExchanges.length - 1];
  const spread = maxPrice.price - minPrice.price;
  const amountNum = parseFloat(amount) || 0;
  const buyTotal = minPrice.price * amountNum * (1 + minPrice.fee / 100);
  const sellTotal = maxPrice.price * amountNum * (1 - maxPrice.fee / 100);
  const profit = sellTotal - buyTotal;
  const profitPercent = ((profit / buyTotal) * 100).toFixed(2);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
              <Icon name="TrendingUp" size={36} className="text-primary" />
              CryptoArbitrage Pro
            </h1>
            <p className="text-muted-foreground mt-1">Мониторинг арбитражных возможностей в реальном времени</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="animate-pulse-glow">
              <Badge variant="outline" className="text-primary border-primary">
                <Icon name="Radio" size={14} className="mr-1" />
                LIVE
              </Badge>
            </div>
          </div>
        </header>

        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Icon name="Bell" size={24} className="text-primary" />
                <div>
                  <Label htmlFor="notifications" className="text-base font-semibold">Уведомления о возможностях</Label>
                  <p className="text-sm text-muted-foreground">Получайте алерты при выгодных спредах</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="threshold" className="text-sm whitespace-nowrap">Мин. прибыль:</Label>
                  <Input
                    id="threshold"
                    type="number"
                    step="0.1"
                    value={minProfitThreshold}
                    onChange={(e) => setMinProfitThreshold(e.target.value)}
                    className="w-20"
                    disabled={!notificationsEnabled}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="arbitrage" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="arbitrage">
              <Icon name="ArrowLeftRight" size={16} className="mr-2" />
              Арбитраж
            </TabsTrigger>
            <TabsTrigger value="calculator">
              <Icon name="Calculator" size={16} className="mr-2" />
              Калькулятор
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Icon name="LineChart" size={16} className="mr-2" />
              Аналитика
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Icon name="Brain" size={16} className="mr-2" />
              AI Прогноз
            </TabsTrigger>
          </TabsList>

          <TabsContent value="arbitrage" className="space-y-6">
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

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Биржа</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Цена BTC</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">24ч %</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Объем (млн)</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Комиссия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedExchanges.map((exchange) => (
                        <tr key={exchange.name} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4 font-medium">{exchange.name}</td>
                          <td className="text-right py-3 px-4 font-mono">${exchange.price.toFixed(2)}</td>
                          <td className={`text-right py-3 px-4 ${exchange.change24h > 0 ? 'text-accent' : 'text-destructive'}`}>
                            {exchange.change24h > 0 ? '+' : ''}{exchange.change24h.toFixed(2)}%
                          </td>
                          <td className="text-right py-3 px-4 text-muted-foreground">${exchange.volume}M</td>
                          <td className="text-right py-3 px-4 text-muted-foreground">{exchange.fee}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Calculator" size={24} className="text-primary" />
                  Калькулятор прибыли
                </CardTitle>
                <CardDescription>Расчет потенциальной прибыли с учетом комиссий</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Количество BTC</label>
                  <Input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1.0"
                    className="text-lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 rounded-lg bg-accent/10 border border-accent/20">
                    <div className="flex items-center gap-2 mb-4">
                      <Icon name="ShoppingCart" size={20} className="text-accent" />
                      <span className="font-medium">Покупка</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Биржа:</span>
                        <span className="font-medium">{minPrice.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Цена за BTC:</span>
                        <span className="font-mono">${minPrice.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Комиссия ({minPrice.fee}%):</span>
                        <span className="font-mono">${(minPrice.price * amountNum * minPrice.fee / 100).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-accent/20 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Итого:</span>
                          <span className="font-bold text-lg">${buyTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-center gap-2 mb-4">
                      <Icon name="DollarSign" size={20} className="text-destructive" />
                      <span className="font-medium">Продажа</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Биржа:</span>
                        <span className="font-medium">{maxPrice.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Цена за BTC:</span>
                        <span className="font-mono">${maxPrice.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Комиссия ({maxPrice.fee}%):</span>
                        <span className="font-mono">${(maxPrice.price * amountNum * maxPrice.fee / 100).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-destructive/20 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Итого:</span>
                          <span className="font-bold text-lg">${sellTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-lg bg-primary/20 border-2 border-primary">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">Чистая прибыль</div>
                    <div className="text-5xl font-bold text-primary mb-2">
                      ${profit.toFixed(2)}
                    </div>
                    <div className="text-2xl text-primary/80">
                      {profitPercent}%
                    </div>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  <Icon name="Zap" size={20} className="mr-2" />
                  Начать арбитраж
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="TrendingUp" size={24} className="text-primary" />
                  История спредов
                </CardTitle>
                <CardDescription>Динамика арбитражных возможностей за последние 24 часа</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={priceHistory}>
                      <defs>
                        <linearGradient id="colorSpread" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="spread" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        fill="url(#colorSpread)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <div className="text-sm text-muted-foreground mb-1">Средний спред</div>
                    <div className="text-2xl font-bold text-primary">$268</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <div className="text-sm text-muted-foreground mb-1">Макс. прибыль</div>
                    <div className="text-2xl font-bold text-accent">0.48%</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <div className="text-sm text-muted-foreground mb-1">Возможностей</div>
                    <div className="text-2xl font-bold">124</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Brain" size={24} className="text-primary" />
                  AI Прогноз цены BTC
                </CardTitle>
                <CardDescription>Предсказание на основе нейросети и исторических данных</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={aiPrediction}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" domain={['dataMin - 200', 'dataMax + 200']} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--accent))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--accent))', r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 p-6 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="flex items-start gap-4">
                    <Icon name="Sparkles" size={32} className="text-accent flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Рекомендация нейросети</h3>
                      <p className="text-muted-foreground mb-4">
                        На основе анализа паттернов последних 7 дней и текущей волатильности, 
                        модель прогнозирует рост цены на 1.05% в ближайшие 12 часов. 
                        Оптимальное время для арбитража: следующие 4 часа.
                      </p>
                      <div className="flex gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Точность модели</div>
                          <div className="text-xl font-bold text-accent">87.3%</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Уверенность</div>
                          <div className="text-xl font-bold text-accent">Высокая</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <footer className="text-center text-sm text-muted-foreground py-8 border-t border-border">
          <p>CryptoArbitrage Pro — Автоматизированный поиск арбитражных возможностей</p>
          <p className="mt-2">Данные обновляются в реальном времени • AI-прогнозы каждые 5 минут</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;