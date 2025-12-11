import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Exchange {
  name: string;
  price: number;
  fee: number;
}

interface ProfitCalculatorProps {
  exchanges: Exchange[];
  selectedCrypto: string;
}

export const ProfitCalculator = ({ exchanges, selectedCrypto }: ProfitCalculatorProps) => {
  const [investmentAmount, setInvestmentAmount] = useState<string>('1000');
  const [buyExchange, setBuyExchange] = useState<string>('');
  const [sellExchange, setSellExchange] = useState<string>('');
  const [tradingFrequency, setTradingFrequency] = useState<string>('1');

  const sortedExchanges = useMemo(() => {
    return [...exchanges].sort((a, b) => a.price - b.price);
  }, [exchanges]);

  useMemo(() => {
    if (sortedExchanges.length > 0 && !buyExchange) {
      setBuyExchange(sortedExchanges[0].name);
    }
    if (sortedExchanges.length > 1 && !sellExchange) {
      setSellExchange(sortedExchanges[sortedExchanges.length - 1].name);
    }
  }, [sortedExchanges, buyExchange, sellExchange]);

  const calculation = useMemo(() => {
    const investment = parseFloat(investmentAmount) || 0;
    const frequency = parseInt(tradingFrequency) || 1;

    if (investment <= 0 || !buyExchange || !sellExchange) {
      return {
        profitPerTrade: 0,
        profitPercentage: 0,
        dailyProfit: 0,
        monthlyProfit: 0,
        yearlyProfit: 0,
        cryptoAmount: 0,
        buyPrice: 0,
        sellPrice: 0,
        buyFee: 0,
        sellFee: 0,
      };
    }

    const buyEx = exchanges.find(e => e.name === buyExchange);
    const sellEx = exchanges.find(e => e.name === sellExchange);

    if (!buyEx || !sellEx) {
      return {
        profitPerTrade: 0,
        profitPercentage: 0,
        dailyProfit: 0,
        monthlyProfit: 0,
        yearlyProfit: 0,
        cryptoAmount: 0,
        buyPrice: 0,
        sellPrice: 0,
        buyFee: 0,
        sellFee: 0,
      };
    }

    const cryptoAmount = investment / buyEx.price;
    const buyFee = investment * (buyEx.fee / 100);
    const sellRevenue = cryptoAmount * sellEx.price;
    const sellFee = sellRevenue * (sellEx.fee / 100);
    
    const profitPerTrade = sellRevenue - investment - buyFee - sellFee;
    const profitPercentage = (profitPerTrade / investment) * 100;
    
    const dailyProfit = profitPerTrade * frequency;
    const monthlyProfit = dailyProfit * 30;
    const yearlyProfit = dailyProfit * 365;

    return {
      profitPerTrade,
      profitPercentage,
      dailyProfit,
      monthlyProfit,
      yearlyProfit,
      cryptoAmount,
      buyPrice: buyEx.price,
      sellPrice: sellEx.price,
      buyFee,
      sellFee,
    };
  }, [investmentAmount, buyExchange, sellExchange, tradingFrequency, exchanges]);

  return (
    <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur border-primary/20 shadow-lg">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Icon name="Calculator" size={24} className="text-primary" />
          Калькулятор прибыли
          <Badge variant="outline" className="ml-auto text-primary border-primary">
            <Icon name="TrendingUp" size={14} className="mr-1" />
            Прогноз
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="investment" className="flex items-center gap-2">
              <Icon name="DollarSign" size={16} className="text-muted-foreground" />
              Сумма инвестиций (USD)
            </Label>
            <Input
              id="investment"
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(e.target.value)}
              placeholder="1000"
              className="text-lg font-semibold"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency" className="flex items-center gap-2">
              <Icon name="BarChart3" size={16} className="text-muted-foreground" />
              Сделок в день
            </Label>
            <Input
              id="frequency"
              type="number"
              value={tradingFrequency}
              onChange={(e) => setTradingFrequency(e.target.value)}
              placeholder="1"
              min="1"
              className="text-lg font-semibold"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyEx" className="flex items-center gap-2">
              <Icon name="ShoppingCart" size={16} className="text-green-500" />
              Купить на бирже
            </Label>
            <Select value={buyExchange} onValueChange={setBuyExchange}>
              <SelectTrigger id="buyEx">
                <SelectValue placeholder="Выберите биржу" />
              </SelectTrigger>
              <SelectContent>
                {sortedExchanges.map((ex) => (
                  <SelectItem key={ex.name} value={ex.name}>
                    {ex.name} - ${ex.price.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sellEx" className="flex items-center gap-2">
              <Icon name="TrendingUp" size={16} className="text-red-500" />
              Продать на бирже
            </Label>
            <Select value={sellExchange} onValueChange={setSellExchange}>
              <SelectTrigger id="sellEx">
                <SelectValue placeholder="Выберите биржу" />
              </SelectTrigger>
              <SelectContent>
                {sortedExchanges.slice().reverse().map((ex) => (
                  <SelectItem key={ex.name} value={ex.name}>
                    {ex.name} - ${ex.price.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {calculation.profitPerTrade !== 0 && (
          <>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Покупка {selectedCrypto}</span>
                <span className="font-mono font-semibold">
                  {calculation.cryptoAmount.toFixed(8)} {selectedCrypto}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Цена покупки</span>
                <span className="font-mono">${calculation.buyPrice.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Цена продажи</span>
                <span className="font-mono">${calculation.sellPrice.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Комиссия (покупка + продажа)</span>
                <span className="font-mono text-red-400">
                  -${(calculation.buyFee + calculation.sellFee).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Zap" size={20} className="text-green-500" />
                    <span className="text-sm text-muted-foreground">За 1 сделку</span>
                  </div>
                  <div className="text-3xl font-bold text-green-500">
                    ${calculation.profitPerTrade.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {calculation.profitPercentage > 0 ? '+' : ''}
                    {calculation.profitPercentage.toFixed(2)}% ROI
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Calendar" size={20} className="text-blue-500" />
                    <span className="text-sm text-muted-foreground">За день</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-500">
                    ${calculation.dailyProfit.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {tradingFrequency} сделок
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="CalendarRange" size={20} className="text-purple-500" />
                    <span className="text-sm text-muted-foreground">За месяц</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-500">
                    ${calculation.monthlyProfit.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    ~30 дней
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="CalendarClock" size={20} className="text-orange-500" />
                    <span className="text-sm text-muted-foreground">За год</span>
                  </div>
                  <div className="text-3xl font-bold text-orange-500">
                    ${calculation.yearlyProfit.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    365 дней
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={18} className="text-accent mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold text-accent mb-1">Важная информация:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Расчёты учитывают комиссии бирж за покупку и продажу</li>
                    <li>Реальная прибыль зависит от волатильности и ликвидности</li>
                    <li>Не забудьте учесть время и комиссии за переводы между биржами</li>
                    <li>Прогнозы основаны на текущих ценах и могут измениться</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
