import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Trade {
  id: string;
  date: string;
  crypto: string;
  buyExchange: string;
  sellExchange: string;
  investmentAmount: number;
  profit: number;
  profitPercent: number;
}

export const TradingHistory = () => {
  const { toast } = useToast();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    crypto: 'BTC',
    buyExchange: '',
    sellExchange: '',
    investmentAmount: '',
    profit: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('tradingHistory');
    if (saved) {
      try {
        setTrades(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse trading history', e);
      }
    }
  }, []);

  const saveToLocalStorage = (newTrades: Trade[]) => {
    localStorage.setItem('tradingHistory', JSON.stringify(newTrades));
  };

  const addTrade = () => {
    const { crypto, buyExchange, sellExchange, investmentAmount, profit } = formData;

    if (!buyExchange || !sellExchange || !investmentAmount || !profit) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    const investment = parseFloat(investmentAmount);
    const profitValue = parseFloat(profit);

    if (investment <= 0 || isNaN(investment)) {
      toast({
        title: 'Ошибка',
        description: 'Сумма инвестиций должна быть больше 0',
        variant: 'destructive',
      });
      return;
    }

    const newTrade: Trade = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      crypto,
      buyExchange,
      sellExchange,
      investmentAmount: investment,
      profit: profitValue,
      profitPercent: (profitValue / investment) * 100,
    };

    const newTrades = [newTrade, ...trades];
    setTrades(newTrades);
    saveToLocalStorage(newTrades);

    setFormData({
      crypto: 'BTC',
      buyExchange: '',
      sellExchange: '',
      investmentAmount: '',
      profit: '',
    });
    setIsDialogOpen(false);

    toast({
      title: '✅ Сделка добавлена',
      description: `${profitValue > 0 ? 'Прибыль' : 'Убыток'}: $${Math.abs(profitValue).toFixed(2)}`,
    });
  };

  const deleteTrade = (id: string) => {
    const newTrades = trades.filter(t => t.id !== id);
    setTrades(newTrades);
    saveToLocalStorage(newTrades);
    toast({
      title: 'Сделка удалена',
    });
  };

  const stats = useMemo(() => {
    const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
    const totalInvested = trades.reduce((sum, t) => sum + t.investmentAmount, 0);
    const avgProfit = trades.length > 0 ? totalProfit / trades.length : 0;
    const winRate = trades.length > 0 
      ? (trades.filter(t => t.profit > 0).length / trades.length) * 100 
      : 0;
    const bestTrade = trades.length > 0 
      ? trades.reduce((best, t) => t.profitPercent > best.profitPercent ? t : best, trades[0])
      : null;

    return {
      totalProfit,
      totalInvested,
      avgProfit,
      winRate,
      bestTrade,
      totalTrades: trades.length,
    };
  }, [trades]);

  const chartData = useMemo(() => {
    if (trades.length === 0) return [];

    const sorted = [...trades].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let capital = 0;
    return sorted.map(trade => {
      capital += trade.profit;
      return {
        date: new Date(trade.date).toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
        }),
        capital,
        profit: trade.profit,
      };
    });
  }, [trades]);

  const maxCapital = Math.max(...chartData.map(d => Math.abs(d.capital)), 100);

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur border-primary/20 shadow-lg">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Icon name="History" size={24} className="text-primary" />
              История сделок
              <Badge variant="outline" className="text-primary border-primary">
                {stats.totalTrades}
              </Badge>
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Icon name="Plus" size={16} />
                  Добавить сделку
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Новая сделка</DialogTitle>
                  <DialogDescription>
                    Добавьте информацию о совершённой арбитражной сделке
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="newCrypto">Криптовалюта</Label>
                    <select
                      id="newCrypto"
                      value={formData.crypto}
                      onChange={(e) => setFormData({ ...formData, crypto: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-md"
                    >
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="SOL">Solana (SOL)</option>
                      <option value="XRP">Ripple (XRP)</option>
                      <option value="BNB">Binance Coin (BNB)</option>
                      <option value="USDT">Tether (USDT)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newBuyEx">Биржа покупки</Label>
                      <Input
                        id="newBuyEx"
                        placeholder="Binance"
                        value={formData.buyExchange}
                        onChange={(e) => setFormData({ ...formData, buyExchange: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newSellEx">Биржа продажи</Label>
                      <Input
                        id="newSellEx"
                        placeholder="Kraken"
                        value={formData.sellExchange}
                        onChange={(e) => setFormData({ ...formData, sellExchange: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newInvestment">Инвестиции ($)</Label>
                      <Input
                        id="newInvestment"
                        type="number"
                        placeholder="1000"
                        value={formData.investmentAmount}
                        onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newProfit">Прибыль ($)</Label>
                      <Input
                        id="newProfit"
                        type="number"
                        placeholder="45.50"
                        value={formData.profit}
                        onChange={(e) => setFormData({ ...formData, profit: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button onClick={addTrade} className="w-full">
                    <Icon name="Check" size={16} className="mr-2" />
                    Сохранить сделку
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {stats.totalTrades === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="TrendingUp" size={64} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg mb-2">История сделок пуста</p>
              <p className="text-sm">Добавьте свою первую сделку, чтобы отслеживать прогресс</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className={`${stats.totalProfit >= 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="DollarSign" size={16} className={stats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'} />
                      <span className="text-xs text-muted-foreground">Всего</span>
                    </div>
                    <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${Math.abs(stats.totalProfit).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-500/10 border-blue-500/20">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="BarChart3" size={16} className="text-blue-500" />
                      <span className="text-xs text-muted-foreground">Средняя</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-500">
                      ${Math.abs(stats.avgProfit).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-500/10 border-purple-500/20">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="Target" size={16} className="text-purple-500" />
                      <span className="text-xs text-muted-foreground">Win Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-500">
                      {stats.winRate.toFixed(0)}%
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-orange-500/10 border-orange-500/20">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="Trophy" size={16} className="text-orange-500" />
                      <span className="text-xs text-muted-foreground">Лучшая</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-500">
                      {stats.bestTrade ? `${stats.bestTrade.profitPercent.toFixed(1)}%` : '0%'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {chartData.length > 0 && (
                <Card className="bg-card/30 border-border/50 mb-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Icon name="TrendingUp" size={20} className="text-primary" />
                      <h3 className="font-semibold">График роста капитала</h3>
                    </div>
                    <div className="space-y-2">
                      {chartData.map((point, index) => {
                        const isPositive = point.capital >= 0;
                        const barWidth = (Math.abs(point.capital) / maxCapital) * 100;
                        
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground font-mono">{point.date}</span>
                              <div className="flex items-center gap-2">
                                <span className={`font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                  ${point.capital.toFixed(2)}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {point.profit > 0 ? '+' : ''}{point.profit.toFixed(2)}
                                </Badge>
                              </div>
                            </div>
                            <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Icon name="List" size={18} className="text-muted-foreground" />
                  Последние сделки
                </h3>
                {trades.slice(0, 10).map((trade) => {
                  const isProfit = trade.profit > 0;
                  
                  return (
                    <div
                      key={trade.id}
                      className={`p-3 rounded-lg border ${isProfit ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'} hover:scale-[1.01] transition-all`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono text-xs">
                            {trade.crypto}
                          </Badge>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">{trade.buyExchange}</span>
                            <Icon name="ArrowRight" size={14} />
                            <span className="text-muted-foreground">{trade.sellExchange}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={`font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                              {isProfit ? '+' : ''}{trade.profit.toFixed(2)} USD
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {trade.profitPercent.toFixed(2)}% • {new Date(trade.date).toLocaleDateString('ru-RU')}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTrade(trade.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
