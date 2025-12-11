import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface Props {
  selectedCurrency: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  chains?: {
    chain: string[];
    exchanges: string[];
    profitPercent: number;
    description: string;
  }[];
}

export const AIAssistantTab = ({ selectedCurrency }: Props) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Привет! Я AI помощник по криптоарбитражу. Могу помочь найти связки под твои требования. Например:\n\n• "Найди связки с BTC и прибылью от 5%"\n• "Какие связки можно сделать с USDT?"\n• "Покажи связки через Binance"\n• "Как работает арбитраж между криптовалютами?"\n\nЗадай свой вопрос!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const predefinedChains = [
    { chain: ['BTC', 'ETH', 'USDT', 'BTC'], exchanges: ['Binance', 'Bybit', 'KuCoin'], profitPercent: 6.85, description: 'Классическая связка через стейблкоин' },
    { chain: ['ETH', 'BTC', 'SOL', 'ETH'], exchanges: ['OKX', 'Gate.io', 'Binance'], profitPercent: 5.42, description: 'Трехшаговая связка через топ криптовалюты' },
    { chain: ['SOL', 'USDT', 'XRP', 'SOL'], exchanges: ['Bybit', 'HTX', 'OKX'], profitPercent: 4.73, description: 'Альткоины через USDT' },
    { chain: ['BNB', 'ETH', 'BTC', 'BNB'], exchanges: ['Binance', 'KuCoin', 'Bybit'], profitPercent: 6.12, description: 'Связка биржевых токенов' },
    { chain: ['XRP', 'DOGE', 'LTC', 'XRP'], exchanges: ['Gate.io', 'Binance', 'OKX'], profitPercent: 5.88, description: 'Мемкоины и классика' },
    { chain: ['USDT', 'BTC', 'ETH', 'USDT'], exchanges: ['Bybit', 'OKX', 'Gate.io'], profitPercent: 4.25, description: 'Стейбл через мейджоры' },
    { chain: ['ADA', 'SOL', 'MATIC', 'ADA'], exchanges: ['KuCoin', 'HTX', 'Binance'], profitPercent: 6.95, description: 'Layer-1 блокчейны' },
    { chain: ['DOT', 'AVAX', 'BNB', 'DOT'], exchanges: ['Bybit', 'Binance', 'Gate.io'], profitPercent: 5.15, description: 'Экосистемные токены' },
    { chain: ['LTC', 'DOGE', 'XRP', 'LTC'], exchanges: ['OKX', 'KuCoin', 'HTX'], profitPercent: 4.58, description: 'Старые альткоины' },
    { chain: ['MATIC', 'ADA', 'DOT', 'MATIC'], exchanges: ['Gate.io', 'Bybit', 'OKX'], profitPercent: 6.38, description: 'Proof-of-Stake монеты' },
  ];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Симуляция AI ответа
    setTimeout(() => {
      const lowerInput = input.toLowerCase();
      const response: Message = { role: 'assistant', content: '', chains: [] };

      // Поиск связок по запросу
      if (lowerInput.includes('найди') || lowerInput.includes('покажи') || lowerInput.includes('связки')) {
        const matchedChains = predefinedChains.filter(chain => {
          // Поиск по криптовалюте
          if (lowerInput.includes('btc') && !chain.chain.includes('BTC')) return false;
          if (lowerInput.includes('eth') && !chain.chain.includes('ETH')) return false;
          if (lowerInput.includes('usdt') && !chain.chain.includes('USDT')) return false;
          if (lowerInput.includes('sol') && !chain.chain.includes('SOL')) return false;
          if (lowerInput.includes('bnb') && !chain.chain.includes('BNB')) return false;
          if (lowerInput.includes('xrp') && !chain.chain.includes('XRP')) return false;
          
          // Поиск по бирже
          if (lowerInput.includes('binance') && !chain.exchanges.some(e => e.toLowerCase().includes('binance'))) return false;
          if (lowerInput.includes('bybit') && !chain.exchanges.some(e => e.toLowerCase().includes('bybit'))) return false;
          if (lowerInput.includes('okx') && !chain.exchanges.some(e => e.toLowerCase().includes('okx'))) return false;
          if (lowerInput.includes('kucoin') && !chain.exchanges.some(e => e.toLowerCase().includes('kucoin'))) return false;
          
          // Поиск по прибыли
          const profitMatch = lowerInput.match(/(\d+)%/);
          if (profitMatch) {
            const minProfit = parseInt(profitMatch[1]);
            if (chain.profitPercent < minProfit) return false;
          }
          
          return true;
        });

        if (matchedChains.length > 0) {
          response.content = `Нашёл ${matchedChains.length} подходящих связок:`;
          response.chains = matchedChains;
        } else {
          response.content = 'К сожалению, не нашёл связок под твои требования. Попробуй изменить параметры поиска или снизить минимальную прибыль.';
        }
      } 
      // Вопросы о том, как работает арбитраж
      else if (lowerInput.includes('как работает') || lowerInput.includes('что такое')) {
        response.content = `Криптоарбитраж — это заработок на разнице цен криптовалют между биржами или парами обмена.

**Межбиржевой арбитраж:**
Покупаешь крипту на одной бирже дешевле, продаёшь на другой дороже.

**Цепочки обмена (связки):**
Обмениваешь одну криптовалюту на другую по цепочке через несколько бирж, возвращаясь к исходной монете с прибылью.

Например: BTC → ETH → USDT → BTC
Начинаешь с 1 BTC, проходишь цепочку обменов и получаешь 1.0685 BTC (+6.85% прибыли).

**Важно учитывать:**
• Комиссии бирж (0.1-0.5%)
• Скорость транзакций
• Ликвидность рынка
• Волатильность цен`;
      }
      // Вопросы о лучших связках
      else if (lowerInput.includes('лучш') || lowerInput.includes('самы') || lowerInput.includes('выгодн')) {
        const topChains = predefinedChains.sort((a, b) => b.profitPercent - a.profitPercent).slice(0, 3);
        response.content = 'Вот топ-3 самых выгодных связок сейчас:';
        response.chains = topChains;
      }
      // Вопросы о конкретных биржах
      else if (lowerInput.includes('binance') || lowerInput.includes('bybit') || lowerInput.includes('okx') || lowerInput.includes('бирж')) {
        response.content = `**Популярные биржи для арбитража:**

🥇 **Binance** — самая ликвидная биржа, низкие комиссии (0.1%), быстрые переводы
🥈 **Bybit** — удобный интерфейс, хорошие спреды, комиссия 0.1%
🥉 **OKX** — широкий выбор пар, средние комиссии 0.15%
📊 **KuCoin** — много альткоинов, комиссия 0.1%
💎 **Gate.io** — экзотические пары, комиссия 0.15%
🔥 **HTX** — хорошие условия для новых токенов

Лучше использовать 2-3 биржи одновременно для максимальной эффективности.`;
      }
      // Советы по рискам
      else if (lowerInput.includes('риск') || lowerInput.includes('опасн') || lowerInput.includes('безопасн')) {
        response.content = `⚠️ **Основные риски арбитража:**

1. **Волатильность** — цена может измениться пока переводишь крипту
2. **Комиссии** — съедают прибыль (учитывай комиссии бирж и сети)
3. **Скорость** — медленные транзакции = упущенная прибыль
4. **Ликвидность** — можешь не найти покупателя по нужной цене
5. **Блокировка счёта** — биржи могут заморозить при подозрительной активности

**Как снизить риски:**
✅ Начинай с малых сумм
✅ Используй стейблкоины (USDT) для быстрых переводов
✅ Проверяй глубину рынка перед сделкой
✅ Держи средства на нескольких биржах
✅ Используй биржи с хорошей репутацией`;
      }
      // Вопросы о капитале
      else if (lowerInput.includes('сколько') || lowerInput.includes('капитал') || lowerInput.includes('деньг')) {
        response.content = `💰 **Необходимый капитал для арбитража:**

**Минимальный старт:** $100-500
Но прибыль будет небольшой ($5-25 с связки)

**Рекомендуемый:** $1000-5000
Оптимальный баланс между риском и доходностью

**Профессиональный:** $10,000+
Позволяет захватывать крупные спреды и диверсифицировать

**Формула расчёта:**
Прибыль = Капитал × Спред % - Комиссии

Пример: $1000 × 6.5% - $5 (комиссии) = $60 чистой прибыли

Главное — не вкладывать последние деньги и начинать с малого!`;
      }
      // Общие вопросы
      else {
        response.content = `Я могу помочь с:

🔍 **Поиском связок** — "Найди связки с BTC от 5%"
📊 **Анализом бирж** — "Какие биржи лучше для арбитража?"
💡 **Объяснениями** — "Как работает арбитраж?"
⚠️ **Рисками** — "Какие риски в арбитраже?"
💰 **Капиталом** — "Сколько нужно денег для старта?"

Задай конкретный вопрос, и я помогу!`;
      }

      setMessages(prev => [...prev, response]);
      setIsLoading(false);
    }, 1000);
  };

  const currencySymbol = selectedCurrency === 'RUB' ? '₽' : '$';
  const multiplier = selectedCurrency === 'RUB' ? 95 : 1;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Bot" className="text-purple-500" />
            AI Помощник по Арбитражу
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-[500px] overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-lg">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'} rounded-lg p-4 shadow-sm`}>
                  <div className="flex items-start gap-2 mb-2">
                    <Icon name={msg.role === 'user' ? 'User' : 'Bot'} size={18} className={msg.role === 'user' ? 'text-primary-foreground' : 'text-purple-500'} />
                    <span className="text-sm font-semibold">{msg.role === 'user' ? 'Вы' : 'AI'}</span>
                  </div>
                  <div className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</div>
                  
                  {msg.chains && msg.chains.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {msg.chains.map((chain, i) => (
                        <div key={i} className="p-3 bg-background/50 rounded-lg border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/30">
                                #{i + 1}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs">
                                {chain.chain.map((crypto, j) => (
                                  <span key={j} className="flex items-center gap-1">
                                    <span className="font-semibold">{crypto}</span>
                                    {j < chain.chain.length - 1 && <Icon name="ArrowRight" size={10} />}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <Badge className="bg-green-500 text-white">
                              +{chain.profitPercent.toFixed(2)}%
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">{chain.description}</div>
                          <div className="flex items-center gap-2 text-xs">
                            <Icon name="Building2" size={12} className="text-primary" />
                            <span>{chain.exchanges.join(' → ')}</span>
                          </div>
                          <div className="mt-2 pt-2 border-t border-border/50 text-xs">
                            <span className="text-muted-foreground">Прибыль с {currencySymbol}1000: </span>
                            <span className="font-bold text-green-500">+{currencySymbol}{(1000 * multiplier * chain.profitPercent / 100).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Icon name="Bot" size={18} className="text-purple-500" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Напиши свой вопрос или запрос... (Enter для отправки)"
              className="resize-none min-h-[60px]"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading}
              className="shrink-0 px-6"
            >
              <Icon name="Send" size={18} />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInput('Найди связки с BTC и прибылью от 5%')}
              disabled={isLoading}
            >
              <Icon name="Sparkles" size={14} className="mr-1" />
              Связки с BTC
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInput('Как работает арбитраж?')}
              disabled={isLoading}
            >
              <Icon name="HelpCircle" size={14} className="mr-1" />
              Как работает?
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInput('Покажи самые выгодные связки')}
              disabled={isLoading}
            >
              <Icon name="TrendingUp" size={14} className="mr-1" />
              Топ связок
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInput('Какие биржи лучше использовать?')}
              disabled={isLoading}
            >
              <Icon name="Building2" size={14} className="mr-1" />
              Лучшие биржи
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
