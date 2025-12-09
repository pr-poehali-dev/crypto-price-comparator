import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface SchemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  buyUrl: string;
  sellUrl: string;
  crypto: string;
  netProfit: number;
  netProfitPercent: number;
}

export const SchemeModal = ({
  isOpen,
  onClose,
  buyExchange,
  sellExchange,
  buyPrice,
  sellPrice,
  buyUrl,
  sellUrl,
  crypto,
  netProfit,
  netProfitPercent,
}: SchemeModalProps) => {
  const [investAmount, setInvestAmount] = useState<number>(1000);

  const cryptoAmount = investAmount / buyPrice;
  const sellRevenue = cryptoAmount * sellPrice;
  const buyFee = investAmount * (0.1 / 100);
  const sellFee = sellRevenue * (0.1 / 100);
  const transferFee = 2;
  const totalProfit = sellRevenue - investAmount - buyFee - sellFee - transferFee;
  const totalProfitPercent = (totalProfit / investAmount) * 100;

  const steps = [
    {
      icon: 'Wallet',
      title: 'Регистрация на биржах',
      description: `Создайте аккаунты на ${buyExchange} и ${sellExchange}`,
      action: 'Открыть биржи',
      url: buyUrl,
    },
    {
      icon: 'ShoppingCart',
      title: 'Покупка криптовалюты',
      description: `Купите ${crypto} на ${buyExchange} по цене $${buyPrice.toFixed(2)}`,
      action: 'Купить на ' + buyExchange,
      url: buyUrl,
    },
    {
      icon: 'Send',
      title: 'Перевод между биржами',
      description: `Переведите ${crypto} с ${buyExchange} на ${sellExchange}`,
      action: 'Инструкция по переводу',
      url: `${buyUrl}/withdraw`,
    },
    {
      icon: 'Banknote',
      title: 'Продажа криптовалюты',
      description: `Продайте ${crypto} на ${sellExchange} по цене $${sellPrice.toFixed(2)}`,
      action: 'Продать на ' + sellExchange,
      url: sellUrl,
    },
    {
      icon: 'TrendingUp',
      title: 'Получение прибыли',
      description: `Чистая прибыль: $${totalProfit.toFixed(2)} (${totalProfitPercent.toFixed(2)}%)`,
      action: 'Повторить цикл',
      url: null,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Icon name="Zap" size={28} className="text-primary" />
            Пошаговая инструкция по схеме
          </DialogTitle>
          <DialogDescription>
            Подробный гайд по реализации арбитражной схемы {buyExchange} → {sellExchange}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Покупка</div>
                  <div className="text-xl font-bold text-accent">{buyExchange}</div>
                  <div className="text-lg">${buyPrice.toFixed(2)}</div>
                </div>
                <div className="flex items-center justify-center">
                  <Icon name="ArrowRight" size={32} className="text-primary" />
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Продажа</div>
                  <div className="text-xl font-bold text-destructive">{sellExchange}</div>
                  <div className="text-lg">${sellPrice.toFixed(2)}</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50 text-center">
                <div className="text-sm text-muted-foreground">Чистая прибыль</div>
                <div className="text-3xl font-bold text-primary">
                  +${netProfit.toFixed(2)} ({netProfitPercent.toFixed(2)}%)
                </div>
              </div>
            </CardContent>
          </Card>

          {steps.map((step, index) => (
            <Card key={index} className="bg-card/50 border-border hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Icon name={step.icon as any} size={24} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded">
                        Шаг {index + 1}
                      </span>
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-3">{step.description}</p>
                    {step.url && (
                      <Button
                        size="sm"
                        onClick={() => window.open(step.url || '#', '_blank')}
                      >
                        <Icon name="ExternalLink" size={16} className="mr-2" />
                        {step.action}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-primary/10 border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Icon name="Calculator" size={24} className="text-primary" />
                <h4 className="font-semibold text-lg">Калькулятор прибыли</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Сумма инвестиции (USD)
                  </label>
                  <Input
                    type="number"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(Number(e.target.value))}
                    min="100"
                    step="100"
                    className="text-lg font-semibold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <div className="text-xs text-muted-foreground">Покупка {crypto}</div>
                    <div className="font-mono text-sm">{cryptoAmount.toFixed(6)} {crypto}</div>
                    <div className="text-xs text-muted-foreground mt-1">Комиссия: ${buyFee.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Продажа {crypto}</div>
                    <div className="font-mono text-sm">${sellRevenue.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground mt-1">Комиссия: ${sellFee.toFixed(2)}</div>
                  </div>
                </div>
                <div className="p-4 bg-primary/20 rounded-lg border-2 border-primary/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Чистая прибыль</div>
                      <div className="text-3xl font-bold text-primary">${totalProfit.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Процент</div>
                      <div className="text-3xl font-bold text-primary">{totalProfitPercent.toFixed(2)}%</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-3">
                    * Учтены комиссии бирж (0.1%) и перевод (~$2)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-accent/10 border-accent/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Icon name="AlertTriangle" size={24} className="text-accent flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-2">Важные предупреждения:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Учитывайте комиссии за вывод и перевод между биржами</li>
                    <li>• Время перевода между биржами: 10-60 минут (цена может измениться)</li>
                    <li>• Минимальная сумма для арбитража: $100-500 (зависит от комиссий)</li>
                    <li>• Проверяйте лимиты на вывод и ликвидность на биржах</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Закрыть
            </Button>
            <Button
              onClick={() => {
                window.open(buyUrl, '_blank');
                setTimeout(() => window.open(sellUrl, '_blank'), 500);
              }}
              className="flex-1"
            >
              <Icon name="Rocket" size={20} className="mr-2" />
              Открыть биржи и начать
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};