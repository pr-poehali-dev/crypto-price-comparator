import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

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
  const cryptoExchanges = exchanges.filter(ex => 
    !ex.paymentMethod || !ex.paymentMethod.includes('Карт')
  );

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
    
    return schemes.sort((a, b) => b.netProfitPercent - a.netProfitPercent).slice(0, 10);
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
            Арбитраж через криптокошельки: биржа → биржа, P2P-переводы
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
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4 pb-4">
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
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <Badge className="bg-green-500 text-white">
                          <Icon name="TrendingUp" size={12} className="mr-1" />
                          TOP
                        </Badge>
                      )}
                      <span className="font-semibold text-lg">
                        #{index + 1} Схема
                      </span>
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
                  
                  <div className="flex flex-col items-end gap-1">
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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