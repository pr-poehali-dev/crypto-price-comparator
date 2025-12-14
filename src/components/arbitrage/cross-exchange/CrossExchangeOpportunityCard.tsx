import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { ArbitrageOpportunity, InstructionStep } from './types';

interface Props {
  opportunity: ArbitrageOpportunity;
  index: number;
  selectedCrypto: string;
  selectedCurrency: string;
}

export const CrossExchangeOpportunityCard = ({ 
  opportunity, 
  index, 
  selectedCrypto, 
  selectedCurrency 
}: Props) => {
  const currencySymbol = selectedCurrency === 'RUB' ? '₽' : '$';
  const multiplier = selectedCurrency === 'RUB' ? 95 : 1;

  const getDetailedInstructions = (opp: ArbitrageOpportunity): InstructionStep[] => {
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

  const instructions = getDetailedInstructions(opportunity);

  return (
    <Card 
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
                    <span className="font-semibold text-sm md:text-base truncate">{opportunity.buyExchange}</span>
                  </div>
                  <Icon name="ArrowRight" size={16} className="hidden sm:block text-muted-foreground shrink-0 md:w-5 md:h-5" />
                  <Icon name="ArrowDown" size={16} className="sm:hidden text-muted-foreground shrink-0" />
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30 text-xs md:text-sm whitespace-nowrap">
                      <Icon name="ArrowUpCircle" size={12} className="mr-1 md:w-3.5 md:h-3.5" />
                      Продать
                    </Badge>
                    <span className="font-semibold text-sm md:text-base truncate">{opportunity.sellExchange}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 text-xs md:text-sm">
                  <div>
                    <p className="text-muted-foreground">Спред</p>
                    <p className="font-semibold text-green-500">{opportunity.spread.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Прибыль</p>
                    <p className="font-semibold">{opportunity.profit.toFixed(2)}%</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-muted-foreground">Объем</p>
                    <p className="font-semibold">{currencySymbol}{(opportunity.volume / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <Badge 
                className={`text-sm md:text-lg font-bold px-3 py-1 ${
                  opportunity.spread >= 5 
                    ? 'bg-green-500 text-white' 
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                +{opportunity.spread.toFixed(2)}%
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
                      <p className="font-bold text-green-500">+{currencySymbol}{(10000 * multiplier * opportunity.spread / 100).toFixed(0)}</p>
                    </div>
                    <div className="bg-background/50 p-2 rounded">
                      <p className="text-muted-foreground text-xs">Итого</p>
                      <p className="font-bold text-primary">{currencySymbol}{(10000 * multiplier * (1 + opportunity.spread / 100)).toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {opportunity.buyDirectUrl && (
                  <Button 
                    className="flex-1"
                    onClick={() => window.open(opportunity.buyDirectUrl, '_blank')}
                  >
                    <Icon name="ShoppingCart" size={16} className="mr-2" />
                    Купить на {opportunity.buyExchange}
                  </Button>
                )}
                {opportunity.sellDirectUrl && (
                  <Button 
                    className="flex-1"
                    variant="outline"
                    onClick={() => window.open(opportunity.sellDirectUrl, '_blank')}
                  >
                    <Icon name="DollarSign" size={16} className="mr-2" />
                    Продать на {opportunity.sellExchange}
                  </Button>
                )}
              </div>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
};
