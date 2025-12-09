import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface QuickBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchangeName: string;
  exchangeUrl: string;
  crypto: string;
  price: number;
}

export const QuickBuyModal = ({ isOpen, onClose, exchangeName, exchangeUrl, crypto, price }: QuickBuyModalProps) => {
  const { toast } = useToast();
  const [buyAmount, setBuyAmount] = useState<string>('100');
  const cryptoAmount = (parseFloat(buyAmount) || 0) / price;

  const getTradingUrl = () => {
    const cleanCrypto = crypto.toUpperCase();
    
    const urls: Record<string, string> = {
      'Binance': `https://www.binance.com/en/trade/${cleanCrypto}_USDT`,
      'Coinbase': `https://www.coinbase.com/price/${crypto.toLowerCase()}`,
      'Kraken': `https://www.kraken.com/prices/${crypto.toLowerCase()}`,
      'KuCoin': `https://www.kucoin.com/trade/${cleanCrypto}-USDT`,
      'Gate.io': `https://www.gate.io/trade/${cleanCrypto}_USDT`,
      'Bybit': `https://www.bybit.com/trade/usdt/${cleanCrypto}USDT`,
      'OKX': `https://www.okx.com/trade-spot/${crypto.toLowerCase()}-usdt`,
      'Bitfinex': `https://trading.bitfinex.com/t/${cleanCrypto}:USD`,
      'Huobi': `https://www.huobi.com/en-us/exchange/${crypto.toLowerCase()}_usdt`,
      'Bitget': `https://www.bitget.com/spot/${cleanCrypto}USDT`,
      'MEXC': `https://www.mexc.com/exchange/${cleanCrypto}_USDT`,
      'Gemini': `https://www.gemini.com/prices/${crypto.toLowerCase()}`,
      'HTX': `https://www.htx.com/en-us/trade/${crypto.toLowerCase()}_usdt`,
      'Crypto.com': `https://crypto.com/exchange/trade/${crypto.toLowerCase()}_usd`,
      'Bitrue': `https://www.bitrue.com/trade/${crypto.toLowerCase()}_usdt`,
    };

    return urls[exchangeName] || exchangeUrl;
  };

  const handleQuickBuy = () => {
    toast({
      title: "🚀 Переход на биржу",
      description: `Открываю страницу торговли ${crypto} на ${exchangeName}. Используйте ваш API ключ для автоматической торговли.`,
      duration: 5000,
    });
    
    window.open(getTradingUrl(), '_blank');
    onClose();
  };

  const handleApiSetup = () => {
    toast({
      title: "⚙️ Настройка API",
      description: "Функция настройки API ключей в разработке. Скоро вы сможете торговать прямо с платформы!",
      duration: 5000,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="ShoppingCart" size={24} className="text-primary" />
            Быстрая покупка на {exchangeName}
          </DialogTitle>
          <DialogDescription>
            Купите {crypto} по текущей рыночной цене
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Текущая цена</span>
              <span className="text-lg font-bold">${price.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Биржа</span>
              <span className="text-sm font-medium">{exchangeName}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyAmount">Сумма покупки (USD)</Label>
            <Input
              id="buyAmount"
              type="number"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              placeholder="100"
              className="text-lg"
              inputMode="decimal"
            />
            <p className="text-xs text-muted-foreground">
              Вы получите ≈ {cryptoAmount.toFixed(8)} {crypto}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={16} className="text-primary mt-0.5" />
              <div className="text-xs text-muted-foreground">
                Нажмите "Перейти к покупке" - откроется страница торговли на бирже. 
                Для автоматической торговли подключите API ключи.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleApiSetup} className="w-full">
              <Icon name="Settings" size={16} className="mr-2" />
              API ключи
            </Button>
            <Button onClick={handleQuickBuy} className="w-full">
              <Icon name="ExternalLink" size={16} className="mr-2" />
              Перейти к покупке
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
