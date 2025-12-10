import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface VerifiedSchemesHeaderProps {
  verifiedCount: number;
  isTesting: boolean;
  testProgress: number;
  onRetest: () => void;
  exchangesLength: number;
}

export const VerifiedSchemesHeader = ({ 
  verifiedCount, 
  isTesting, 
  testProgress, 
  onRetest,
  exchangesLength 
}: VerifiedSchemesHeaderProps) => {
  return (
    <Card className="bg-card/50 backdrop-blur border-border">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Icon name="CheckCircle2" size={24} className="text-green-500" />
              Проверенные связки
            </CardTitle>
            <CardDescription>Автоматически протестированные арбитражные схемы</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {verifiedCount > 0 && (
              <Badge className="bg-green-500/20 text-green-500 border-green-500">
                <Icon name="Shield" size={12} className="mr-1" />
                {verifiedCount} проверено
              </Badge>
            )}
            <Button 
              onClick={onRetest} 
              disabled={isTesting || exchangesLength === 0}
              size="sm"
            >
              {isTesting ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Тестирую...
                </>
              ) : (
                <>
                  <Icon name="RotateCw" size={16} className="mr-2" />
                  Перепроверить
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isTesting && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Проверка связок...</span>
              <span className="text-sm font-semibold">{Math.round(testProgress)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${testProgress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
