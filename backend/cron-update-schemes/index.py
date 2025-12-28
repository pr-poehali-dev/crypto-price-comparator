import json
import os
import psycopg2
from datetime import datetime, timedelta
from typing import Dict, Any, List
import requests

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    CRON задача: автообновление арбитражных связок каждые 24 часа
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    print(f'[CRON] Starting automatic schemes update at {datetime.now().isoformat()}')
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    cryptos = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'TRX', 'MATIC']
    new_schemes = 0
    deleted_schemes = 0
    errors = []
    
    for crypto in cryptos:
        try:
            print(f'[CRON] Fetching prices for {crypto}')
            response = requests.get(
                f'https://functions.poehali.dev/ac977fcc-5718-4e2b-b050-2421e770d97e?crypto={crypto}',
                timeout=15
            )
            
            if response.ok:
                data = response.json()
                exchanges = data.get('exchanges', [])
                
                if len(exchanges) >= 2:
                    exchanges_sorted = sorted(exchanges, key=lambda x: x['price'])
                    buy_ex = exchanges_sorted[0]
                    sell_ex = exchanges_sorted[-1]
                    
                    spread_percent = ((sell_ex['price'] - buy_ex['price']) / buy_ex['price']) * 100
                    profit_usd = (sell_ex['price'] - buy_ex['price']) * 1
                    
                    if spread_percent >= 0.1:
                        cur.execute(
                            "INSERT INTO arbitrage_schemes (crypto, buy_exchange, sell_exchange, buy_price, sell_price, spread_percent, profit_usd) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                            (crypto, buy_ex['name'], sell_ex['name'], buy_ex['price'], sell_ex['price'], spread_percent, profit_usd)
                        )
                        new_schemes += 1
                        print(f'[CRON] Added scheme for {crypto}: {spread_percent:.2f}% spread')
                    else:
                        print(f'[CRON] Skipped {crypto}: spread too low ({spread_percent:.2f}%)')
            else:
                errors.append(f'{crypto}: HTTP {response.status_code}')
                print(f'[CRON] Error fetching {crypto}: {response.status_code}')
        except Exception as e:
            errors.append(f'{crypto}: {str(e)}')
            print(f'[CRON] Error processing {crypto}: {str(e)}')
    
    yesterday = datetime.now() - timedelta(days=1)
    cur.execute(
        "DELETE FROM arbitrage_schemes WHERE created_at < %s OR spread_percent < 0.05",
        (yesterday,)
    )
    deleted_schemes = cur.rowcount
    print(f'[CRON] Deleted {deleted_schemes} old schemes')
    
    conn.commit()
    cur.close()
    conn.close()
    
    result = {
        'success': True,
        'new_schemes': new_schemes,
        'deleted_schemes': deleted_schemes,
        'errors': errors,
        'timestamp': datetime.now().isoformat(),
        'message': f'CRON: Updated {new_schemes} schemes, deleted {deleted_schemes} old'
    }
    
    print(f'[CRON] Completed: {result["message"]}')
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps(result)
    }