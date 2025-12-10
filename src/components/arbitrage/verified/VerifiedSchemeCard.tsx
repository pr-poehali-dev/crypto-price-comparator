import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

export interface VerifiedScheme {
  id: string;
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
  hasCards: boolean;
  isVerified: boolean;
  verificationStatus: 'testing' | 'verified' | 'failed';
  lastChecked: Date;
  isSmallDeposit?: boolean;
}

interface VerifiedSchemeCardProps {
  scheme: VerifiedScheme;
  index: number;
  onClick: () => void;
}

export const VerifiedSchemeCard = ({ scheme, index, onClick }: VerifiedSchemeCardProps) => {
  return (
    <Card 
      className={`${
        scheme.isVerified 
          ? 'bg-green-500/5 border-green-500/30 hover:bg-green-500/10' 
          : 'bg-card/50'
      } transition-all cursor-pointer`}
      onClick={onClick}
    >
      <CardContent className="pt-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            {scheme.isVerified && (
              <div className="flex-shrink-0">
                <Icon name="CheckCircle2" size={32} className="text-green-500" />
              </div>
            )}
            {scheme.verificationStatus === 'testing' && (
              <div className="flex-shrink-0">
                <Icon name="Loader2" size={32} className="text-blue-500 animate-spin" />
              </div>
            )}
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-lg">#{index + 1}</span>
                {scheme.hasCards && (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500">
                    <Icon name="CreditCard" size={12} className="mr-1" />
                    Карты
                  </Badge>
                )}
                {scheme.isVerified && (
                  <Badge className="bg-green-500/20 text-green-500 border-green-500">
                    <Icon name="Shield" size={12} className="mr-1" />
                    Проверено
                  </Badge>
                )}
                {scheme.isSmallDeposit && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500">
                    <Icon name="DollarSign" size={12} className="mr-1" />
                    Для малого депозита
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Icon name="ShoppingCart" size={16} className="text-blue-500" />
                <span className="font-medium">{scheme.buyFrom}</span>
                <Badge variant="outline" className="text-xs">
                  ${scheme.buyPrice.toFixed(2)}
                </Badge>
                <Icon name="ArrowRight" size={16} className="text-muted-foreground" />
                <Icon name="TrendingUp" size={16} className="text-green-500" />
                <span className="font-medium">{scheme.sellTo}</span>
                <Badge variant="outline" className="text-xs">
                  ${scheme.sellPrice.toFixed(2)}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground">
                Последняя проверка: {scheme.lastChecked.toLocaleTimeString('ru-RU')}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-500">
                +{scheme.netProfitPercent.toFixed(2)}%
              </div>
              <div className="text-sm text-muted-foreground">
                ${scheme.netProfit.toFixed(2)}
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Icon name="TrendingUp" size={14} />
              <span>Спред: ${scheme.spreadValue.toFixed(2)}</span>
            </div>
            
            <div className="flex gap-1 text-xs">
              <Badge variant="outline" className="text-xs">
                Покупка: {scheme.buyFee}%
              </Badge>
              <Badge variant="outline" className="text-xs">
                Продажа: {scheme.sellFee}%
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
