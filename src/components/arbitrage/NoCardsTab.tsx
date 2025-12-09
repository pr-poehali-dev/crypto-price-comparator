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
  const cryptoExchanges = exchanges.filter(ex => 
    !ex.paymentMethod || !ex.paymentMethod.includes('Карт')
  );

  const sortedByPrice = [...cryptoExchanges].sort((a, b) => a.price - b.price);
  
  const calculateProfitSchemes = (minSpread: number = 2.0) => {
    const schemes = [];
    const minDeposit = 50;
    const withdrawalFee = 2.5;
    
    for (let i = 0; i < sortedByPrice.length; i++) {
      const buyExchange = sortedByPrice[i];
      
      for (let j = sortedByPrice.length - 1; j > i; j--) {
        const sellExchange = sortedByPrice[j];
        const spreadValue = sellExchange.price - buyExchange.price;
        const buyFeeAmount = buyExchange.price * (buyExchange.fee / 100);
        const sellFeeAmount = sellExchange.price * (sellExchange.fee / 100);
        const netProfit = spreadValue - buyFeeAmount - sellFeeAmount;
        const netProfitPercent = (netProfit / buyExchange.price) * 100;
        
        const cryptoAmount = minDeposit / buyExchange.price;
        const totalBuyCost = minDeposit + (minDeposit * buyExchange.fee / 100);
        const sellRevenue = cryptoAmount * sellExchange.price;
        const totalSellFee = sellRevenue * (sellExchange.fee / 100);
        const netProfitForMinDeposit = sellRevenue - totalBuyCost - totalSellFee - withdrawalFee;
        
        if (netProfitPercent >= minSpread && netProfitForMinDeposit > 0.5) {
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
            minDepositProfit: netProfitForMinDeposit,
          });
        }
      }
    }
    
    return schemes.sort((a, b) => b.netProfitPercent - a.netProfitPercent).slice(0, 20);
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
            Арбитраж через криптокошельки: биржа → биржа, P2P-переводы. Минимальный депозит от $50
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
              <span>Быстрый вывод через P2P на СБП/наличные</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon name="DollarSign" size={16} className="text-green-500" />
              <span>Прибыльные связки даже с депозитом $50</span>
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
                      {scheme.minDepositProfit >= 1.0 && scheme.minDepositProfit <= 3.0 && (
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500">
                          <Icon name="GraduationCap" size={12} className="mr-1" />
                          Для новичков
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
                      <span>•</span>
                      <span className="text-green-600 font-medium">С $50: +${scheme.minDepositProfit.toFixed(2)}</span>
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
          <div className="flex items-start gap-3">
            <Icon name="Info" size={20} className="text-blue-500 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-semibold">Как работает схема без карт:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                <li>Покупаете крипту на бирже с низкой ценой</li>
                <li>Переводите на кошелек (обычно через TRC20/BEP20 - низкие комиссии)</li>
                <li>Продаете на площадке с высокой ценой через P2P (СБП/наличные)</li>
                <li>Получаете прибыль без использования банковских карт</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};