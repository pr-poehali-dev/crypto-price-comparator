import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { SchemeDetailModal } from './SchemeDetailModal';

interface Exchange {
  name: string;
  price: number;
  volume: number;
  fee: number;
  change24h: number;
  url?: string;
  paymentMethod?: string;
}

interface NoCardsTabProps {
  exchanges: Exchange[];
  selectedCrypto: string;
}

export const NoCardsTab = ({ exchanges, selectedCrypto }: NoCardsTabProps) => {
  const [selectedScheme, setSelectedScheme] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const mockExchanges: Exchange[] = [
    { name: 'HTX', price: 94920, volume: 18000, fee: 0.2, change24h: 1.92, url: 'https://www.htx.com' },
    { name: 'KuCoin', price: 95050, volume: 28000, fee: 0.1, change24h: 2.08, url: 'https://www.kucoin.com' },
    { name: 'Bybit', price: 95180, volume: 32000, fee: 0.1, change24h: 2.15, url: 'https://www.bybit.com' },
    { name: 'Binance', price: 95420, volume: 58000, fee: 0.1, change24h: 2.34, url: 'https://www.binance.com' },
    { name: 'OKX', price: 95650, volume: 45000, fee: 0.08, change24h: 2.41, url: 'https://www.okx.com' },
    { name: 'Gate.io', price: 96180, volume: 22000, fee: 0.2, change24h: 2.67, url: 'https://www.gate.io' },
    { name: 'MEXC', price: 96420, volume: 20000, fee: 0.2, change24h: 2.78, url: 'https://www.mexc.com' },
    { name: 'Exmo', price: 96850, volume: 8000, fee: 0.4, change24h: 3.12, url: 'https://exmo.com' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 60;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getCountdownColor = () => {
    if (countdown > 40) return 'text-green-500';
    if (countdown > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const openSchemeDetails = (scheme: any) => {
    setSelectedScheme(scheme);
    setIsModalOpen(true);
  };

  const cryptoExchanges = exchanges.length > 0 
    ? exchanges.filter(ex => 
        !ex.name.includes('P2P') && 
        !ex.name.includes('BestChange') && 
        !ex.name.includes('Cryptomus') &&
        (!ex.paymentMethod || !ex.paymentMethod.includes('Карт'))
      )
    : mockExchanges;

  const sortedByPrice = [...cryptoExchanges].sort((a, b) => a.price - b.price);
  
  const calculateProfitSchemes = (minSpread: number = 2.0) => {
    const schemes = [];
    
    for (let i = 0; i < sortedByPrice.length; i++) {
      const buyExchange = sortedByPrice[i];
      
      for (let j = sortedByPrice.length - 1; j > i; j--) {
        const sellExchange = sortedByPrice[j];
        const spreadValue = sellExchange.price - buyExchange.price;
        const buyFeeAmount = buyExchange.price * (buyExchange.fee / 100);
        const sellFeeAmount = sellExchange.price * (sellExchange.fee / 100);
        const netProfit = spreadValue - buyFeeAmount - sellFeeAmount;
        const netProfitPercent = (netProfit / buyExchange.price) * 100;
        
        if (netProfitPercent >= minSpread) {
          schemes.push({
            buyFrom: buyExchange.name,
            buyPrice: buyExchange.price,
            buyFee: buyExchange.fee,
            sellTo: sellExchange.name,
            sellPrice: sellExchange.price,
            sellFee: sellExchange.fee,
            spreadValue,
            netProfit,
            netProfitPercent,
            buyUrl: buyExchange.url,
            sellUrl: sellExchange.url,
          });
        }
      }
    }
    
    return schemes.sort((a, b) => b.netProfitPercent - a.netProfitPercent).slice(0, 15);
  };

  const profitSchemes = calculateProfitSchemes(2.0);

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-background border-green-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Icon name="Wallet" className="text-green-500" size={24} />
            <CardTitle className="text-lg">Связки без банковских карт</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Арбитраж через криптокошельки: только биржа → биржа
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Icon name="CheckCircle2" size={16} className="text-green-500" />
              <span>Только крипто-переводы между платформами</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Shield" size={16} className="text-green-500" />
              <span>Без привязки банковских карт и счетов</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Zap" size={16} className="text-green-500" />
              <span>Быстрые транзакции между биржами</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Icon name="Target" size={24} className="text-primary" />
              <div>
                <p className="font-semibold text-lg">Найдено схем с прибылью ≥ 2%: {profitSchemes.length}</p>
                <p className="text-sm text-muted-foreground">
                  {profitSchemes.length > 0 
                    ? `Лучшая прибыль: ${profitSchemes[0].netProfitPercent.toFixed(2)}%`
                    : 'Ожидание данных с бирж...'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Clock" size={20} className={getCountdownColor()} />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Обновление через</p>
                <p className={`text-xl font-bold ${getCountdownColor()}`}>{countdown}с</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {profitSchemes.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <Icon name="SearchX" size={32} className="mx-auto mb-2 opacity-50" />
            <p className="font-semibold mb-1">Схемы с прибылью ≥ 2% не найдены</p>
            <p className="text-sm">Попробуйте выбрать другую криптовалюту или подождите обновления цен</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {profitSchemes.map((scheme, index) => (
            <Card 
              key={index} 
              className={`${
                index === 0 
                  ? 'bg-gradient-to-r from-green-500/5 to-emerald-500/5 border-green-500/30' 
                  : 'bg-card/50 backdrop-blur'
              }`}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {index === 0 && (
                        <Badge className="bg-green-500 text-white">
                          <Icon name="TrendingUp" size={12} className="mr-1" />
                          TOP
                        </Badge>
                      )}
                      {index < 3 && index > 0 && (
                        <Badge className="bg-blue-500 text-white">
                          HOT
                        </Badge>
                      )}

                      <span className="font-semibold text-lg">
                        #{index + 1} Схема
                      </span>
                      {scheme.netProfitPercent >= 2.5 && (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500">
                          <Icon name="Flame" size={12} className="mr-1" />
                          Высокий спред
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Icon name="ShoppingCart" size={16} className="text-blue-500" />
                        <a 
                          href={scheme.buyUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {scheme.buyFrom}
                        </a>
                        <Badge variant="outline" className="text-xs">
                          ${scheme.buyPrice.toFixed(2)}
                        </Badge>
                      </div>
                      
                      <Icon name="ArrowRight" size={16} className="text-muted-foreground hidden md:block" />
                      
                      <div className="flex items-center gap-2">
                        <Icon name="TrendingUp" size={16} className="text-green-500" />
                        <a 
                          href={scheme.sellUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {scheme.sellTo}
                        </a>
                        <Badge variant="outline" className="text-xs">
                          ${scheme.sellPrice.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>Спред: ${scheme.spreadValue.toFixed(2)}</span>
                      <span>•</span>
                      <span>Комиссии: {scheme.buyFee}% + {scheme.sellFee}%</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className={`text-2xl font-bold ${
                      scheme.netProfitPercent >= 0.5 ? 'text-green-500' : 
                      scheme.netProfitPercent >= 0.2 ? 'text-yellow-500' : 
                      'text-red-500'
                    }`}>
                      {scheme.netProfitPercent >= 0 ? '+' : ''}{scheme.netProfitPercent.toFixed(2)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${Math.abs(scheme.netProfit).toFixed(2)} / {selectedCrypto}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => openSchemeDetails(scheme)}
                      className="mt-1"
                    >
                      <Icon name="BookOpen" size={14} className="mr-2" />
                      Инструкция
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SchemeDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        scheme={selectedScheme}
        crypto={selectedCrypto}
      />

      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="pt-4 pb-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-blue-500 mt-0.5 shrink-0" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-base">💡 Как работает схема без карт:</p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-2">
                  <li><strong>Покупка:</strong> Покупаете криптовалюту на бирже с низкой ценой (например HTX, KuCoin)</li>
                  <li><strong>Перевод:</strong> Выводите на свой криптокошелек через TRC-20/BEP-20 (комиссия $1-3, время 3-10 мин)</li>
                  <li><strong>Пополнение:</strong> Пополняете вторую биржу с высокой ценой (Exmo, MEXC, Gate.io)</li>
                  <li><strong>Продажа:</strong> Продаете через P2P за рубли на СБП/Тинькофф (без банковских карт!)</li>
                  <li><strong>Профит:</strong> Получаете чистую прибыль 2-3% за цикл 40-90 минут</li>
                </ol>
              </div>
            </div>
            
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Icon name="AlertCircle" size={16} className="text-amber-500 mt-0.5 shrink-0" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong className="text-amber-600">⚠️ Важно для новичков:</strong></p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Начните с малой суммы $50-100 для теста</li>
                    <li>Всегда проверяйте актуальность спреда перед началом</li>
                    <li>Используйте TRC-20 сеть для USDT (самые низкие комиссии ~$1)</li>
                    <li>Спред может измениться за 40-60 минут цикла</li>
                    <li>Выбирайте P2P продавцов/покупателей с рейтингом >98%</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-green-500/10 border border-green-500/30 rounded">
                <p className="text-green-600 font-semibold mb-1">✅ Плюсы:</p>
                <ul className="text-muted-foreground space-y-0.5 ml-3 list-disc">
                  <li>Нет KYC для кошелька</li>
                  <li>Никаких банковских карт</li>
                  <li>Быстрые переводы</li>
                  <li>Полный контроль криптой</li>
                </ul>
              </div>
              <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                <p className="text-yellow-600 font-semibold mb-1">⚡ Время цикла:</p>
                <ul className="text-muted-foreground space-y-0.5 ml-3 list-disc">
                  <li>Покупка: 3-10 мин</li>
                  <li>Вывод на кошелек: 5-15 мин</li>
                  <li>Перевод на биржу: 5-15 мин</li>
                  <li>P2P продажа: 10-30 мин</li>
                </ul>
              </div>
              <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded">
                <p className="text-purple-600 font-semibold mb-1">💰 Доходность:</p>
                <ul className="text-muted-foreground space-y-0.5 ml-3 list-disc">
                  <li>1 цикл: 2-3% прибыли</li>
                  <li>2-3 цикла/день возможно</li>
                  <li>С $500: ≈$30-45/день</li>
                  <li>Месяц: $900-1350+</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};