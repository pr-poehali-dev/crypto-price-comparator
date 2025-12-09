import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';

interface Scheme {
  buyFrom: string;
  buyPrice: number;
  buyFee: number;
  sellTo: string;
  sellPrice: number;
  sellFee: number;
  spreadValue: number;
  netProfit: number;
  netProfitPercent: number;
  buyUrl?: string;
  sellUrl?: string;
}

interface SchemeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheme: Scheme | null;
  crypto: string;
}

export const SchemeDetailModal = ({ isOpen, onClose, scheme, crypto }: SchemeDetailModalProps) => {
  const [showBuyWidget, setShowBuyWidget] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(60);
      setIsExpired(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!scheme) return null;

  const getTimerColor = () => {
    if (timeLeft > 40) return 'text-green-500';
    if (timeLeft > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTimerBgColor = () => {
    if (timeLeft > 40) return 'bg-green-500/10 border-green-500/30';
    if (timeLeft > 20) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  const steps = [
    {
      number: 1,
      title: `Регистрация на ${scheme.buyFrom}`,
      description: `Зарегистрируйтесь на бирже ${scheme.buyFrom} и пройдите верификацию (KYC)`,
      action: 'Перейти на биржу',
      url: scheme.buyUrl,
      icon: 'UserPlus',
      time: '5-10 мин'
    },
    {
      number: 2,
      title: `Купить ${crypto}`,
      description: `Купите ${crypto} на ${scheme.buyFrom} по цене $${scheme.buyPrice.toFixed(2)}`,
      action: 'Купить сейчас',
      onClick: () => setShowBuyWidget(true),
      icon: 'ShoppingCart',
      time: '1-2 мин'
    },
    {
      number: 3,
      title: 'Вывод на кошелёк',
      description: `Выведите ${crypto} на свой криптокошелёк (рекомендуем сеть TRC20 или BEP20 для низких комиссий)`,
      action: 'Как создать кошелёк',
      url: 'https://trustwallet.com',
      icon: 'Wallet',
      time: '5-15 мин'
    },
    {
      number: 4,
      title: `Регистрация на ${scheme.sellTo}`,
      description: `Зарегистрируйтесь на ${scheme.sellTo} для продажи через P2P`,
      action: 'Перейти на платформу',
      url: scheme.sellUrl,
      icon: 'UserCheck',
      time: '3-5 мин'
    },
    {
      number: 5,
      title: `Продать ${crypto}`,
      description: `Продайте ${crypto} на ${scheme.sellTo} по цене $${scheme.sellPrice.toFixed(2)} через P2P (СБП/наличные)`,
      action: 'Открыть P2P',
      url: scheme.sellUrl,
      icon: 'TrendingUp',
      time: '10-30 мин'
    },
    {
      number: 6,
      title: 'Получить прибыль',
      description: `Получите рубли на карту/СБП. Чистая прибыль: $${scheme.netProfit.toFixed(2)} (${scheme.netProfitPercent.toFixed(2)}%)`,
      icon: 'DollarSign',
      time: 'мгновенно'
    }
  ];

  const calculateProfit = (amount: number) => {
    const buyAmount = amount / scheme.buyPrice;
    const buyCost = amount;
    const buyFeeAmount = buyCost * (scheme.buyFee / 100);
    const sellRevenue = buyAmount * scheme.sellPrice;
    const sellFeeAmount = sellRevenue * (scheme.sellFee / 100);
    const netProfit = sellRevenue - buyCost - buyFeeAmount - sellFeeAmount;
    
    return {
      buyAmount: buyAmount.toFixed(6),
      buyCost: buyCost.toFixed(2),
      buyFee: buyFeeAmount.toFixed(2),
      sellRevenue: sellRevenue.toFixed(2),
      sellFee: sellFeeAmount.toFixed(2),
      netProfit: netProfit.toFixed(2),
      netProfitPercent: ((netProfit / buyCost) * 100).toFixed(2)
    };
  };

  const exampleAmounts = [100, 500, 1000, 5000];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Icon name="BookOpen" size={28} className="text-primary" />
            Подробная инструкция по связке
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className={`${getTimerBgColor()} transition-colors duration-300`}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Icon name="Timer" size={40} className={`${getTimerColor()} transition-colors duration-300`} />
                    {isExpired && (
                      <Icon name="AlertCircle" size={16} className="absolute -top-1 -right-1 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {isExpired ? 'Данные устарели' : 'Цены актуальны ещё'}
                    </p>
                    <p className={`text-3xl font-bold ${getTimerColor()} transition-colors duration-300`}>
                      {isExpired ? 'Обновите' : `${timeLeft} сек`}
                    </p>
                  </div>
                </div>
                {isExpired && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Icon name="RefreshCw" size={16} className="mr-2" />
                    Обновить цены
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Схема арбитража</p>
                  <p className="text-xl font-bold">
                    {scheme.buyFrom} → {scheme.sellTo}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Чистая прибыль</p>
                  <p className="text-2xl font-bold text-green-500">
                    +{scheme.netProfitPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {showBuyWidget && (
            <Card className="bg-blue-500/5 border-blue-500/30">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3 mb-3">
                  <Icon name="Info" size={20} className="text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Виджет покупки криптовалюты</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Используйте сторонние сервисы для покупки {crypto}:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`https://www.bybit.com/fiat/trade/express/home?actionType=1&token=${crypto}&fiat=RUB`, '_blank')}
                      >
                        <Icon name="CreditCard" size={16} className="mr-2" />
                        Bybit P2P
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`https://garantex.org/trading/${crypto.toLowerCase()}rub`, '_blank')}
                      >
                        <Icon name="Banknote" size={16} className="mr-2" />
                        Garantex
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`https://www.bestchange.ru/?from=${crypto.toLowerCase()}&to=sberrub`, '_blank')}
                      >
                        <Icon name="ArrowRightLeft" size={16} className="mr-2" />
                        BestChange
                      </Button>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBuyWidget(false)}
                  className="w-full"
                >
                  Скрыть
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Icon name="ListChecks" size={20} />
              Пошаговая инструкция
            </h3>

            {steps.map((step, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur">
                <CardContent className="pt-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon name={step.icon as any} size={20} className="text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge variant="outline" className="mb-2">Шаг {step.number}</Badge>
                          <h4 className="font-semibold text-base">{step.title}</h4>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          <Icon name="Clock" size={12} className="mr-1" />
                          {step.time}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                      {(step.url || step.onClick) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (step.onClick) step.onClick();
                            else if (step.url) window.open(step.url, '_blank');
                          }}
                        >
                          <Icon name="ExternalLink" size={14} className="mr-2" />
                          {step.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Icon name="Calculator" size={20} />
              Примеры расчёта прибыли
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exampleAmounts.map((amount) => {
                const calc = calculateProfit(amount);
                return (
                  <Card key={amount} className="bg-secondary/20">
                    <CardContent className="pt-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold text-base">Вложение:</span>
                          <span className="font-bold text-base">${amount}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Покупка {crypto}:</span>
                          <span>{calc.buyAmount} {crypto}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Комиссия покупки:</span>
                          <span>${calc.buyFee}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Выручка продажи:</span>
                          <span>${calc.sellRevenue}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Комиссия продажи:</span>
                          <span>${calc.sellFee}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-green-500">
                          <span>Чистая прибыль:</span>
                          <span>+${calc.netProfit} ({calc.netProfitPercent}%)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card className="bg-amber-500/5 border-amber-500/30">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Icon name="AlertTriangle" size={20} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">⚠️ Важные моменты:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Цены меняются в реальном времени - проверяйте актуальность перед сделкой</li>
                    <li>Учитывайте комиссии за вывод криптовалюты (~$1-5)</li>
                    <li>P2P сделки могут занять от 10 до 30 минут</li>
                    <li>Используйте двухфакторную аутентификацию на всех биржах</li>
                    <li>Не храните большие суммы на биржах - выводите на холодные кошельки</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={onClose} className="flex-1">
              <Icon name="Check" size={16} className="mr-2" />
              Понятно, начинаю!
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${scheme.buyFrom} ($${scheme.buyPrice.toFixed(2)}) → ${scheme.sellTo} ($${scheme.sellPrice.toFixed(2)}) = +${scheme.netProfitPercent.toFixed(2)}% прибыли`
                );
              }}
            >
              <Icon name="Copy" size={16} className="mr-2" />
              Копировать схему
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};