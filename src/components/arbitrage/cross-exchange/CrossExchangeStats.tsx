import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Props {
  totalOpportunities: number;
  bestSpread: number;
  avgSpread: number;
}

export const CrossExchangeStats = ({ totalOpportunities, bestSpread, avgSpread }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="pt-4 md:pt-6 px-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 bg-primary/10 rounded-xl">
              <Icon name="TrendingUp" size={20} className="text-primary md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Найдено связок</p>
              <p className="text-xl md:text-2xl font-bold">{totalOpportunities}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-green-500/20">
        <CardContent className="pt-4 md:pt-6 px-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 bg-green-500/10 rounded-xl">
              <Icon name="Percent" size={20} className="text-green-500 md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Лучший спред</p>
              <p className="text-xl md:text-2xl font-bold text-green-500">{bestSpread.toFixed(2)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20">
        <CardContent className="pt-4 md:pt-6 px-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 bg-blue-500/10 rounded-xl">
              <Icon name="BarChart3" size={20} className="text-blue-500 md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Средний спред</p>
              <p className="text-xl md:text-2xl font-bold text-blue-500">{avgSpread.toFixed(2)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
