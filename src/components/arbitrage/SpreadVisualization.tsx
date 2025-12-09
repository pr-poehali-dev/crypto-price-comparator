import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { SchemeModal } from './SchemeModal';

interface Exchange {
  name: string;
  price: number;
  volume: number;
  fee: number;
  change24h: number;
  url?: string;
  dataSource?: string;
}

interface SpreadVisualizationProps {
  exchanges: Exchange[];
  selectedCrypto: string;
}

export const SpreadVisualization = ({ exchanges, selectedCrypto }: SpreadVisualizationProps) => {
  const [schemeModalOpen, setSchemeModalOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<{
    buyFrom: string;
    sellTo: string;
    buyPrice: number;
    sellPrice: number;
    buyUrl: string;
    sellUrl: string;
    netProfit: number;
    netProfitPercent: number;
  } | null>(null);

  if (exchanges.length === 0) {
    return null;
  }

  const sortedExchanges = [...exchanges].sort((a, b) => a.price - b.price);
  const minPrice = sortedExchanges[0];
  const maxPrice = sortedExchanges[sortedExchanges.length - 1];
  const spread = maxPrice.price - minPrice.price;
  const spreadPercent = ((spread / minPrice.price) * 100).toFixed(2);

  const topSpreads = sortedExchanges.slice(0, 5).map((lowExchange) => {
    const highExchanges = sortedExchanges.slice(-3);
    return highExchanges.map((highExchange) => {
      const minDeposit = 50;
      const withdrawalFee = 2.5;
      const spreadValue = highExchange.price - lowExchange.price;
      const spreadPct = ((spreadValue / lowExchange.price) * 100).toFixed(2);
      const netProfit = spreadValue - (lowExchange.price * lowExchange.fee / 100) - (highExchange.price * highExchange.fee / 100);
      const netProfitPct = ((netProfit / lowExchange.price) * 100).toFixed(2);
      
      const cryptoAmount = minDeposit / lowExchange.price;
      const totalBuyCost = minDeposit + (minDeposit * lowExchange.fee / 100);
      const sellRevenue = cryptoAmount * highExchange.price;
      const totalSellFee = sellRevenue * (highExchange.fee / 100);
      const netProfitForMinDeposit = sellRevenue - totalBuyCost - totalSellFee - withdrawalFee;
      const isBeginnerFriendly = netProfitForMinDeposit >= 1.0 && netProfitForMinDeposit <= 3.0;

      return {
        buyFrom: lowExchange.name,
        sellTo: highExchange.name,
        spread: spreadValue,
        spreadPercent: parseFloat(spreadPct),
        netProfit,
        netProfitPercent: parseFloat(netProfitPct),
        buyUrl: lowExchange.url,
        sellUrl: highExchange.url,
        buyPrice: lowExchange.price,
        sellPrice: highExchange.price,
        minDepositProfit: netProfitForMinDeposit,
        isBeginnerFriendly,
      };
    });
  }).flat().sort((a, b) => b.netProfitPercent - a.netProfitPercent).slice(0, 15);

  return (
    <Card className="bg-card/50 backdrop-blur border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
          <Icon name="BarChart3" size={24} className="text-accent" />
          Топ-15 схем арбитража
        </CardTitle>
        <CardDescription className="text-sm">Самые выгодные комбинации бирж с учетом комиссий. Минимальный депозит от $50</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 md:p-6 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-xs md:text-sm text-muted-foreground mb-1">Максимальный спред</div>
              <div className="text-2xl md:text-3xl font-bold text-primary">${spread.toFixed(2)}</div>
              <div className="text-sm md:text-base text-primary/80 mt-1">{spreadPercent}%</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">От</div>
                <div className="text-base md:text-lg font-semibold text-accent">{minPrice.name}</div>
                <div className="text-xs text-muted-foreground">${minPrice.price.toFixed(2)}</div>
              </div>
              <Icon name="ArrowRight" size={24} className="text-primary" />
              <div className="text-center">
                <div className="text-xs text-muted-foreground">До</div>
                <div className="text-base md:text-lg font-semibold text-destructive">{maxPrice.name}</div>
                <div className="text-xs text-muted-foreground">${maxPrice.price.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">#</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Купить на</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">→</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Продать на</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Спред</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Чистая прибыль</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">С $50</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Действие</th>
              </tr>
            </thead>
            <tbody>
              {topSpreads.map((item, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4 text-muted-foreground">{index + 1}</td>
                  <td className="py-3 px-4 font-medium text-accent">{item.buyFrom}</td>
                  <td className="text-center py-3 px-4">
                    <Icon name="MoveRight" size={16} className="text-primary mx-auto" />
                  </td>
                  <td className="py-3 px-4 font-medium text-destructive">{item.sellTo}</td>
                  <td className="text-right py-3 px-4">
                    <div className="font-mono">${item.spread.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">{item.spreadPercent}%</div>
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className="font-bold text-primary">${item.netProfit.toFixed(2)}</div>
                    <div className="text-sm text-primary/80">{item.netProfitPercent}%</div>
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className={`font-semibold ${
                      item.minDepositProfit > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {item.minDepositProfit > 0 ? '+' : ''}${item.minDepositProfit.toFixed(2)}
                    </div>
                    {item.isBeginnerFriendly && (
                      <div className="text-xs text-purple-500 font-medium">Новичкам</div>
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    <button
                      onClick={() => {
                        setSelectedScheme(item);
                        setSchemeModalOpen(true);
                      }}
                      className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Icon name="Rocket" size={14} className="inline mr-1" />
                      Схема
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {topSpreads.map((item, index) => (
            <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="text-sm font-bold text-primary">{item.netProfitPercent}%</div>
                  {item.isBeginnerFriendly && (
                    <div className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 text-xs font-medium border border-purple-500/30">
                      <Icon name="GraduationCap" size={10} className="inline mr-1" />
                      Новичкам
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedScheme(item);
                    setSchemeModalOpen(true);
                  }}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-xs font-medium"
                >
                  Схема
                </button>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Купить</div>
                  <div className="font-semibold text-accent">{item.buyFrom}</div>
                </div>
                <Icon name="ArrowRight" size={16} className="text-primary" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Продать</div>
                  <div className="font-semibold text-destructive">{item.sellTo}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
                <div>
                  <div className="text-xs text-muted-foreground">Спред</div>
                  <div className="font-mono text-sm">${item.spread.toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Прибыль</div>
                  <div className="font-bold text-sm text-primary">${item.netProfit.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">С $50</div>
                  <div className={`font-semibold text-sm ${
                    item.minDepositProfit > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {item.minDepositProfit > 0 ? '+' : ''}${item.minDepositProfit.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {selectedScheme && (
        <SchemeModal
          isOpen={schemeModalOpen}
          onClose={() => setSchemeModalOpen(false)}
          buyExchange={selectedScheme.buyFrom}
          sellExchange={selectedScheme.sellTo}
          buyPrice={selectedScheme.buyPrice}
          sellPrice={selectedScheme.sellPrice}
          buyUrl={selectedScheme.buyUrl || ''}
          sellUrl={selectedScheme.sellUrl || ''}
          crypto={selectedCrypto}
          netProfit={selectedScheme.netProfit}
          netProfitPercent={selectedScheme.netProfitPercent}
        />
      )}
    </Card>
  );
};