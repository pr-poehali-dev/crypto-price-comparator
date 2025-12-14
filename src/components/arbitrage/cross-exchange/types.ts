export interface Exchange {
  name: string;
  price: number;
  volume: number;
  fee: number;
  change24h: number;
  url?: string;
}

export interface ArbitrageOpportunity {
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  spread: number;
  profit: number;
  volume: number;
  buyUrl?: string;
  sellUrl?: string;
  buyDirectUrl?: string;
  sellDirectUrl?: string;
}

export interface InstructionStep {
  step: number;
  title: string;
  description: string;
  icon: string;
  time: string;
  url?: string;
}

export const getCryptoUrls = (crypto: string) => {
  const urls: Record<string, Record<string, { buy: string; sell: string }>> = {
    'BTC': {
      'Binance': { buy: 'https://www.binance.com/en/trade/BTC_USDT', sell: 'https://www.binance.com/en/trade/BTC_USDT' },
      'Bybit': { buy: 'https://www.bybit.com/trade/usdt/BTCUSDT', sell: 'https://www.bybit.com/trade/usdt/BTCUSDT' },
      'OKX': { buy: 'https://www.okx.com/trade-spot/btc-usdt', sell: 'https://www.okx.com/trade-spot/btc-usdt' },
      'KuCoin': { buy: 'https://www.kucoin.com/trade/BTC-USDT', sell: 'https://www.kucoin.com/trade/BTC-USDT' },
      'Gate.io': { buy: 'https://www.gate.io/trade/BTC_USDT', sell: 'https://www.gate.io/trade/BTC_USDT' },
      'HTX': { buy: 'https://www.htx.com/trade/btc_usdt', sell: 'https://www.htx.com/trade/btc_usdt' },
      'MEXC': { buy: 'https://www.mexc.com/exchange/BTC_USDT', sell: 'https://www.mexc.com/exchange/BTC_USDT' },
      'Exmo': { buy: 'https://exmo.com/en/trade/BTC_USDT', sell: 'https://exmo.com/en/trade/BTC_USDT' },
    },
    'ETH': {
      'Binance': { buy: 'https://www.binance.com/en/trade/ETH_USDT', sell: 'https://www.binance.com/en/trade/ETH_USDT' },
      'Bybit': { buy: 'https://www.bybit.com/trade/usdt/ETHUSDT', sell: 'https://www.bybit.com/trade/usdt/ETHUSDT' },
      'OKX': { buy: 'https://www.okx.com/trade-spot/eth-usdt', sell: 'https://www.okx.com/trade-spot/eth-usdt' },
      'KuCoin': { buy: 'https://www.kucoin.com/trade/ETH-USDT', sell: 'https://www.kucoin.com/trade/ETH-USDT' },
      'Gate.io': { buy: 'https://www.gate.io/trade/ETH_USDT', sell: 'https://www.gate.io/trade/ETH_USDT' },
      'HTX': { buy: 'https://www.htx.com/trade/eth_usdt', sell: 'https://www.htx.com/trade/eth_usdt' },
      'MEXC': { buy: 'https://www.mexc.com/exchange/ETH_USDT', sell: 'https://www.mexc.com/exchange/ETH_USDT' },
      'Exmo': { buy: 'https://exmo.com/en/trade/ETH_USDT', sell: 'https://exmo.com/en/trade/ETH_USDT' },
    },
    'USDT': {
      'Binance': { buy: 'https://www.binance.com/en/trade/USDT_USD', sell: 'https://www.binance.com/en/trade/USDT_USD' },
      'Bybit': { buy: 'https://www.bybit.com/trade/usdt/USDTUSD', sell: 'https://www.bybit.com/trade/usdt/USDTUSD' },
      'OKX': { buy: 'https://www.okx.com/trade-spot/usdt-usd', sell: 'https://www.okx.com/trade-spot/usdt-usd' },
      'KuCoin': { buy: 'https://www.kucoin.com/trade/USDT-USD', sell: 'https://www.kucoin.com/trade/USDT-USD' },
      'Gate.io': { buy: 'https://www.gate.io/trade/USDT_USD', sell: 'https://www.gate.io/trade/USDT_USD' },
      'HTX': { buy: 'https://www.htx.com/trade/usdt_usd', sell: 'https://www.htx.com/trade/usdt_usd' },
      'MEXC': { buy: 'https://www.mexc.com/exchange/USDT_USD', sell: 'https://www.mexc.com/exchange/USDT_USD' },
      'Exmo': { buy: 'https://exmo.com/en/trade/USDT_USD', sell: 'https://exmo.com/en/trade/USDT_USD' },
    },
  };

  const cryptoUrls = urls[crypto] || urls['BTC'];
  return cryptoUrls;
};
