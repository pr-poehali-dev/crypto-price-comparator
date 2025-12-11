import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { QuickBuyModal } from '@/components/trading/QuickBuyModal';

interface Exchange {
  name: string;
  price: number;
  volume: number;
  fee: number;
  change24h: number;
  url?: string;
  dataSource?: string;
}

interface ArbitrageTabProps {
  exchanges: Exchange[];
  selectedCrypto: string;
  minProfitFilter: number;
  selectedCurrency: string;
}

export const ArbitrageTab = ({ exchanges, selectedCrypto, minProfitFilter, selectedCurrency }: ArbitrageTabProps) => {
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);

  if (exchanges.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Icon name="Target" size={24} className="text-accent" />
            Лучшая возможность сейчас
          </CardTitle>
          <CardDescription className="text-sm">Актуальные спреды между биржами</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Icon name="RefreshCw" size={48} className="text-muted-foreground mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Загрузка актуальных цен...</h3>
            <p className="text-sm text-muted-foreground">Получаем данные с бирж в реальном времени</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedExchanges = [...exchanges].sort((a, b) => a.price - b.price);
  const minPrice = sortedExchanges[0];
  const maxPrice = sortedExchanges[sortedExchanges.length - 1];
  const spread = maxPrice.price - minPrice.price;

  const handleBuyClick = (exchange: Exchange) => {
    setSelectedExchange(exchange);
    setBuyModalOpen(true);
  };

  const opportunitiesAbove3 = sortedExchanges.filter((exchange) => {
    if (exchange.name === 'BestChange P2P') return false;
    const potentialProfit = ((maxPrice.price - exchange.price) / exchange.price) * 100;
    return potentialProfit >= minProfitFilter;
  });

  return (
    <Card className="bg-card/50 backdrop-blur border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
          <Icon name="Target" size={24} className="text-accent" />
          Лучшая возможность сейчас
        </CardTitle>
        <CardDescription className="text-sm">Актуальные спреды между биржами</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">Купить на</div>
            <div className="text-xl md:text-2xl font-bold text-accent">{minPrice.name}</div>
            <div className="text-base md:text-lg mt-2">{selectedCurrency === 'RUB' ? '₽' : '$'}{minPrice.price.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">Комиссия: {minPrice.fee}%</div>
          </div>
          
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex flex-col items-center justify-center">
            <Icon name="ArrowRight" size={28} className="text-primary mb-2 md:block hidden" />
            <Icon name="ArrowDown" size={28} className="text-primary mb-2 md:hidden" />
            <div className="text-xs md:text-sm text-muted-foreground">Спред</div>
            <div className="text-2xl md:text-3xl font-bold text-primary">{selectedCurrency === 'RUB' ? '₽' : '$'}{spread.toFixed(2)}</div>
            <div className="text-xs md:text-sm text-primary/70 mt-1">{((spread / minPrice.price) * 100).toFixed(2)}%</div>
          </div>

          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">Продать на</div>
            <div className="text-xl md:text-2xl font-bold text-destructive">{maxPrice.name}</div>
            <div className="text-base md:text-lg mt-2">{selectedCurrency === 'RUB' ? '₽' : '$'}{maxPrice.price.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">Комиссия: {maxPrice.fee}%</div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-base md:text-lg font-semibold mb-2 flex items-center gap-2">
            <Icon name="TrendingUp" size={20} className="text-accent" />
            Возможности с выгодой от {minProfitFilter}%
          </h3>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Биржа</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Цена ({selectedCrypto})</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">24ч %</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Объем (млн)</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Комиссия</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Выгода</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Источник</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Действие</th>
              </tr>
            </thead>
            <tbody>
              {opportunitiesAbove3.map((exchange) => {
                const potentialProfit = ((maxPrice.price - exchange.price) / exchange.price) * 100;
                return (
                  <tr key={exchange.name} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <a 
                        href={exchange.url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline cursor-pointer"
                      >
                        {exchange.name}
                      </a>
                    </td>
                    <td className="text-right py-3 px-4 font-mono">{selectedCurrency === 'RUB' ? '₽' : '$'}{exchange.price.toFixed(2)}</td>
                    <td className={`text-right py-3 px-4 ${exchange.change24h > 0 ? 'text-accent' : 'text-destructive'}`}>
                      {exchange.change24h > 0 ? '+' : ''}{exchange.change24h.toFixed(2)}%
                    </td>
                    <td className="text-right py-3 px-4 text-muted-foreground">{selectedCurrency === 'RUB' ? '₽' : '$'}{exchange.volume}M</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">{exchange.fee}%</td>
                    <td className="text-right py-3 px-4 font-bold text-accent">
                      +{potentialProfit.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{exchange.dataSource || 'N/A'}</td>
                    <td className="text-center py-3 px-4">
                      <Button 
                        size="sm" 
                        onClick={() => handleBuyClick(exchange)}
                        className="text-xs"
                      >
                        <Icon name="ShoppingCart" size={14} className="mr-1" />
                        Купить
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {opportunitiesAbove3.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    <Icon name="Search" size={32} className="mx-auto mb-2 opacity-50" />
                    Нет возможностей с выгодой от {minProfitFilter}%
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {opportunitiesAbove3.map((exchange) => {
            const potentialProfit = ((maxPrice.price - exchange.price) / exchange.price) * 100;
            return (
              <div key={exchange.name} className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <a 
                      href={exchange.url || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-semibold text-base text-primary hover:underline cursor-pointer"
                    >
                      {exchange.name}
                    </a>
                    <div className="text-lg font-mono font-bold mt-1">{selectedCurrency === 'RUB' ? '₽' : '$'}{exchange.price.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground mt-1">{exchange.dataSource || 'N/A'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-accent">+{potentialProfit.toFixed(2)}%</div>
                    <div className="text-xs text-muted-foreground mt-1">выгода</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div>
                    <div className="text-muted-foreground">24ч</div>
                    <div className={exchange.change24h > 0 ? 'text-accent font-medium' : 'text-destructive font-medium'}>
                      {exchange.change24h > 0 ? '+' : ''}{exchange.change24h.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Объем</div>
                    <div className="font-medium">{selectedCurrency === 'RUB' ? '₽' : '$'}{exchange.volume}M</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Комиссия</div>
                    <div className="font-medium">{exchange.fee}%</div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleBuyClick(exchange)}
                  className="w-full text-sm"
                >
                  <Icon name="ShoppingCart" size={16} className="mr-2" />
                  Купить на {exchange.name}
                </Button>
              </div>
            );
          })}
          {opportunitiesAbove3.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <Icon name="Search" size={48} className="mx-auto mb-3 opacity-50" />
              <div className="text-sm">Нет возможностей с выгодой от {minProfitFilter}%</div>
            </div>
          )}
        </div>

        {selectedExchange && (
          <QuickBuyModal
            isOpen={buyModalOpen}
            onClose={() => setBuyModalOpen(false)}
            exchangeName={selectedExchange.name}
            exchangeUrl={selectedExchange.url || ''}
            crypto={selectedCrypto}
            price={selectedExchange.price}
          />
        )}
      </CardContent>
    </Card>
  );
};