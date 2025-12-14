import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { CrossExchangeStats } from './cross-exchange/CrossExchangeStats';
import { CrossExchangeFilters } from './cross-exchange/CrossExchangeFilters';
import { CrossExchangeOpportunityCard } from './cross-exchange/CrossExchangeOpportunityCard';
import { getCryptoUrls } from './cross-exchange/types';
import type { Exchange, ArbitrageOpportunity } from './cross-exchange/types';

interface Props {
  exchanges: Exchange[];
  selectedCrypto: string;
  selectedCurrency: string;
}

export const CrossExchangeTab = ({ exchanges, selectedCrypto, selectedCurrency }: Props) => {
  const [sortBy, setSortBy] = useState<'spread' | 'profit' | 'volume'>('spread');
  const [minSpread, setMinSpread] = useState<number>(0.1);
  const [minSpreadInput, setMinSpreadInput] = useState<string>('0.1');

  const opportunities = useMemo(() => {
    const result: ArbitrageOpportunity[] = [];
    const cryptoUrls = getCryptoUrls(selectedCrypto);
    
    if (exchanges.length === 0) {
      return result;
    }
    
    for (let i = 0; i < exchanges.length; i++) {
      for (let j = 0; j < exchanges.length; j++) {
        if (i !== j) {
          const buyEx = exchanges[i];
          const sellEx = exchanges[j];
          
          const buyFeeMultiplier = 1 + buyEx.fee / 100;
          const sellFeeMultiplier = 1 - sellEx.fee / 100;
          
          const buyPriceWithFee = buyEx.price * buyFeeMultiplier;
          const sellPriceWithFee = sellEx.price * sellFeeMultiplier;
          
          const spread = ((sellPriceWithFee - buyPriceWithFee) / buyPriceWithFee) * 100;
          
          if (spread >= minSpread) {
            result.push({
              buyExchange: buyEx.name,
              sellExchange: sellEx.name,
              buyPrice: buyEx.price,
              sellPrice: sellEx.price,
              spread: spread,
              profit: spread,
              volume: Math.min(buyEx.volume, sellEx.volume),
              buyUrl: buyEx.url,
              sellUrl: sellEx.url,
              buyDirectUrl: cryptoUrls[buyEx.name]?.buy,
              sellDirectUrl: cryptoUrls[sellEx.name]?.sell
            });
          }
        }
      }
    }
    
    return result.sort((a, b) => {
      if (sortBy === 'spread') return b.spread - a.spread;
      if (sortBy === 'profit') return b.profit - a.profit;
      return b.volume - a.volume;
    });
  }, [exchanges, minSpread, sortBy, selectedCrypto]);

  const totalOpportunities = opportunities.length;
  const avgSpread = opportunities.length > 0 
    ? opportunities.reduce((sum, op) => sum + op.spread, 0) / opportunities.length 
    : 0;
  const bestSpread = opportunities.length > 0 ? opportunities[0].spread : 0;

  return (
    <div className="space-y-4 md:space-y-6">
      <CrossExchangeStats 
        totalOpportunities={totalOpportunities}
        bestSpread={bestSpread}
        avgSpread={avgSpread}
      />

      <CrossExchangeFilters 
        sortBy={sortBy}
        setSortBy={setSortBy}
        minSpreadInput={minSpreadInput}
        setMinSpreadInput={setMinSpreadInput}
        setMinSpread={setMinSpread}
      />

      {opportunities.length === 0 ? (
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="py-12 md:py-16 text-center">
            <Icon name="SearchX" size={48} className="mx-auto text-muted-foreground mb-4 md:w-16 md:h-16" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Связок не найдено</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Попробуйте снизить минимальный спред в фильтрах
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:gap-4">
          {opportunities.map((opp, index) => (
            <CrossExchangeOpportunityCard 
              key={index}
              opportunity={opp}
              index={index}
              selectedCrypto={selectedCrypto}
              selectedCurrency={selectedCurrency}
            />
          ))}
        </div>
      )}
    </div>
  );
};