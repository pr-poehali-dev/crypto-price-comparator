import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  sortBy: 'spread' | 'profit' | 'volume';
  setSortBy: (value: 'spread' | 'profit' | 'volume') => void;
  minSpreadInput: string;
  setMinSpreadInput: (value: string) => void;
  setMinSpread: (value: number) => void;
}

export const CrossExchangeFilters = ({ 
  sortBy, 
  setSortBy, 
  minSpreadInput, 
  setMinSpreadInput, 
  setMinSpread 
}: Props) => {
  return (
    <Card className="bg-card/50 backdrop-blur border-border">
      <CardHeader className="pb-3 md:pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon name="Repeat" className="text-primary w-5 h-5 md:w-6 md:h-6" />
            <CardTitle className="text-base md:text-xl">Фильтры и сортировка</CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">Мин. спред:</span>
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={minSpreadInput}
                onChange={(e) => {
                  setMinSpreadInput(e.target.value);
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val >= 0) {
                    setMinSpread(val);
                  }
                }}
                className="w-[80px] md:w-[100px] h-8 md:h-10 px-2 md:px-3 text-xs md:text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-xs md:text-sm text-muted-foreground">%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">Сортировка:</span>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-[120px] md:w-[140px] h-8 md:h-10 text-xs md:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spread">По спреду</SelectItem>
                  <SelectItem value="profit">По прибыли</SelectItem>
                  <SelectItem value="volume">По объему</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
