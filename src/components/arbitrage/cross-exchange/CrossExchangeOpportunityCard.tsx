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
    const cryptoAmount = (exampleAmount / (opp.buyPrice * multiplier)).toFixed(6);

    return [
      {
        step: 1,
        title: 'Регистрация и верификация на биржах',
        description: `ПОДРОБНО: Зайдите на официальные сайты ${opp.buyExchange} и ${opp.sellExchange}. Нажмите кнопку "Регистрация" (обычно в правом верхнем углу). Заполните форму: email, пароль (минимум 8 символов, с цифрами и буквами). Подтвердите email через письмо. Затем пройдите KYC: загрузите фото паспорта (разворот с фото), селфи с паспортом, и заполните адрес проживания. Проверка занимает 15-30 минут. После одобрения получите уведомление на email. ВАЖНО: Используйте только официальные сайты бирж, проверяйте SSL-сертификат (замок в адресной строке).`,
        icon: 'UserPlus',
        time: '30 мин'
      },
      {
        step: 2,
        title: 'Пополнение счета первой биржи',
        description: `ПОДРОБНО: Войдите в личный кабинет ${opp.buyExchange}. Найдите раздел "Кошелек" или "Активы" → "Пополнить". Выберите способ пополнения: для РФ рекомендуется P2P (перевод на карту другому пользователю) или банковская карта Visa/MasterCard. Для P2P: выберите продавца с высоким рейтингом (>98%), укажите сумму ${currencySymbol}${exampleAmount.toFixed(0)}, переведите деньги на указанную карту через СБП или банковское приложение, подтвердите оплату в системе биржи. Деньги зачисляются за 5-15 минут. СОВЕТ: Начните с малой суммы (${currencySymbol}${(exampleAmount * 0.1).toFixed(0)}) для первого теста связки.`,
        icon: 'Wallet',
        time: '5-15 мин'
      },
      {
        step: 3,
        title: `Покупка ${selectedCrypto} на ${opp.buyExchange}`,
        description: `ПОДРОБНО: В личном кабинете ${opp.buyExchange} найдите раздел "Торговля" → "Spot" или "Спот-торговля". В поисковой строке введите "${selectedCrypto}/USDT". Откроется торговый интерфейс. Справа найдите блок "Купить ${selectedCrypto}". Выберите тип ордера "Market" (рыночный ордер) для мгновенной покупки. Введите сумму в USDT (весь доступный баланс) или укажите количество ${selectedCrypto}. Текущая цена: ≈${currencySymbol}${(opp.buyPrice * multiplier).toFixed(2)} за 1 ${selectedCrypto}. Вы получите примерно ${cryptoAmount} ${selectedCrypto}. Нажмите "Купить ${selectedCrypto}" → Подтвердите операцию. Исполнение за 1-2 секунды. ВАЖНО: Проверьте, что у вас достаточно средств с учетом комиссии биржи (~0.1%).`,
        icon: 'ShoppingCart',
        time: '1-2 мин',
        url: opp.buyDirectUrl
      },
      {
        step: 4,
        title: `Перевод ${selectedCrypto} на ${opp.sellExchange}`,
        description: `ПОДРОБНО: ШАГ 1 (на ${opp.sellExchange}): Войдите в кошелек → "Пополнить" → Найдите ${selectedCrypto} → Нажмите "Депозит". Выберите сеть перевода: для BTC используйте BTC (Bitcoin Network), для ETH - ERC-20 (Ethereum), для USDT - TRC-20 (Tron, самая дешевая, комиссия ~$1). СКОПИРУЙТЕ адрес кошелька (строка из 30-40 символов). ШАГ 2 (на ${opp.buyExchange}): Перейдите в кошелек → Найдите ${selectedCrypto} → "Вывести". Вставьте скопированный адрес ${opp.sellExchange}. КРИТИЧНО: Выберите ТУ ЖЕ СЕТЬ, что и при получении адреса (иначе деньги пропадут!). Укажите количество: ${cryptoAmount} ${selectedCrypto}. Проверьте комиссию сети (обычно 0.0005 BTC для Bitcoin, 0.005 ETH для Ethereum, 1 USDT для TRC-20). Введите код подтверждения из email или SMS. Нажмите "Подтвердить вывод". Транзакция обрабатывается: BTC - 30-60 мин (6 подтверждений), ETH - 10-20 мин (12 подтверждений), USDT TRC-20 - 3-5 мин. Отслеживайте статус в разделе "История переводов". СОВЕТ: Сначала сделайте тестовый перевод малой суммы (10-20 USDT) для проверки адреса и сети.`,
        icon: 'ArrowRightLeft',
        time: '10-60 мин'
      },
      {
        step: 5,
        title: `Продажа ${selectedCrypto} на ${opp.sellExchange}`,
        description: `ПОДРОБНО: Дождитесь зачисления ${selectedCrypto} на ${opp.sellExchange} (проверьте в разделе "Кошелек" → "Спот-кошелек"). Когда появится баланс ${cryptoAmount} ${selectedCrypto}, перейдите в "Торговля" → "Spot". Найдите пару "${selectedCrypto}/USDT". Слева найдите блок "Продать ${selectedCrypto}". Выберите "Market Order" (рыночный ордер). Введите количество ${selectedCrypto}: ${cryptoAmount} или нажмите "100%" для продажи всего объема. Текущая цена продажи: ≈${currencySymbol}${(opp.sellPrice * multiplier).toFixed(2)} за 1 ${selectedCrypto}. Вы получите примерно ${currencySymbol}${(exampleAmount + netProfit).toFixed(2)} USDT. Нажмите "Продать ${selectedCrypto}" → Подтвердите. Сделка исполнится мгновенно. Проверьте баланс USDT в кошельке - должно появиться ${currencySymbol}${(exampleAmount + netProfit).toFixed(2)}. Ваша прибыль: ${currencySymbol}${netProfit.toFixed(2)} (${opp.spread.toFixed(2)}%).`,
        icon: 'DollarSign',
        time: '1-2 мин',
        url: opp.sellDirectUrl
      },
      {
        step: 6,
        title: 'Фиксация и вывод прибыли',
        description: `ПОДРОБНО: У вас на балансе ${opp.sellExchange} теперь ${currencySymbol}${(exampleAmount + netProfit).toFixed(2)} USDT. ВАРИАНТ 1 (Вывод прибыли): Перейдите в "Кошелек" → "Вывод". Выберите USDT и метод вывода: для РФ используйте P2P (продайте USDT покупателю с высоким рейтингом >98%, получите рубли на карту за 5-10 минут). Комиссия P2P: 0-1%. ВАРИАНТ 2 (Реинвестирование): Оставьте ${currencySymbol}${(exampleAmount + netProfit).toFixed(2)} на бирже и найдите следующую прибыльную связку. Повторяйте процесс 2-3 раза в день для максимизации прибыли. ВАРИАНТ 3 (Циклический арбитраж): Если обратная связка ${opp.sellExchange} → ${opp.buyExchange} тоже прибыльна, переведите USDT обратно и повторите цикл. ИТОГО: Чистая прибыль с учетом всех комиссий (торговые 0.1% + вывод 0.1-0.5% + перевод между биржами): примерно ${(opp.spread - 0.7).toFixed(2)}% или ${currencySymbol}${(netProfit * 0.93).toFixed(2)}. СОВЕТ: Заведите таблицу Excel для отслеживания всех операций: дата, биржи, суммы, комиссии, чистая прибыль. Это поможет анализировать эффективность разных связок.`,
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

            <div className="text-right shrink-0 flex flex-col gap-2 items-end">
              {opportunity.spread >= 5 && (
                <Badge className="bg-green-500/20 text-green-500 border-green-500/50 text-xs">
                  <Icon name="CheckCircle2" size={12} className="mr-1" />
                  Проверено
                </Badge>
              )}
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