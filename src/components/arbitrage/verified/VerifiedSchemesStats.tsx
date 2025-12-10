import Icon from '@/components/ui/icon';

interface VerifiedSchemesStatsProps {
  verifiedCount: number;
  smallDepositCount: number;
  cardsCount: number;
  noCardsCount: number;
}

export const VerifiedSchemesStats = ({ 
  verifiedCount, 
  smallDepositCount, 
  cardsCount, 
  noCardsCount 
}: VerifiedSchemesStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="CheckCircle2" size={20} className="text-green-500" />
          <span className="text-sm text-muted-foreground">Проверено связок</span>
        </div>
        <div className="text-2xl font-bold text-green-500">{verifiedCount}</div>
      </div>
      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="DollarSign" size={20} className="text-amber-500" />
          <span className="text-sm text-muted-foreground">Малый депозит</span>
        </div>
        <div className="text-2xl font-bold text-amber-500">{smallDepositCount}</div>
      </div>
      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="CreditCard" size={20} className="text-blue-500" />
          <span className="text-sm text-muted-foreground">С картами</span>
        </div>
        <div className="text-2xl font-bold text-blue-500">{cardsCount}</div>
      </div>
      <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="Wallet" size={20} className="text-purple-500" />
          <span className="text-sm text-muted-foreground">Без карт</span>
        </div>
        <div className="text-2xl font-bold text-purple-500">{noCardsCount}</div>
      </div>
    </div>
  );
};
