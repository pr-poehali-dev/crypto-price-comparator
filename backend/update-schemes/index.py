import json
import os
import psycopg2
from datetime import datetime, timedelta
from typing import Dict, Any, List
import requests

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Автообновление арбитражных связок: создает новые и удаляет неактуальные
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Auth',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    cryptos = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE']
    new_schemes = 0
    deleted_schemes = 0
    
    for crypto in cryptos:
        try:
            response = requests.get(
                f'https://functions.poehali.dev/ac977fcc-5718-4e2b-b050-2421e770d97e?crypto={crypto}',
                timeout=10
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
        except Exception as e:
            print(f'Error fetching {crypto}: {str(e)}')
    
    yesterday = datetime.now() - timedelta(days=1)
    cur.execute(
        "DELETE FROM arbitrage_schemes WHERE created_at < %s OR spread_percent < 0.05",
        (yesterday,)
    )
    deleted_schemes = cur.rowcount
    
    conn.commit()
    cur.close()
    conn.close()
    
    result = {
        'success': True,
        'new_schemes': new_schemes,
        'deleted_schemes': deleted_schemes,
        'timestamp': datetime.now().isoformat()
    }
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps(result)
    }
