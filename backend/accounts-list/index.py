import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Список всех аккаунтов с данными и историей подключений
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Auth',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    headers = event.get('headers', {})
    admin_auth = headers.get('x-admin-auth') or headers.get('X-Admin-Auth')
    
    if admin_auth != 'magome:28122007':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT 
            id, 
            login, 
            registered_at, 
            last_login, 
            token_used, 
            is_active 
        FROM t_p37207906_crypto_price_compara.platform_users 
        ORDER BY registered_at DESC
    """)
    
    accounts = []
    for row in cur.fetchall():
        account_id, login, registered_at, last_login, token_used, is_active = row
        
        cur.execute("""
            SELECT 
                ip_address,
                user_agent,
                device_type,
                browser,
                os,
                logged_in_at
            FROM t_p37207906_crypto_price_compara.user_sessions 
            WHERE user_id = %s 
            ORDER BY logged_in_at DESC 
            LIMIT 10
        """, (account_id,))
        
        sessions = []
        for session_row in cur.fetchall():
            sessions.append({
                'ip_address': session_row[0],
                'user_agent': session_row[1],
                'device_type': session_row[2],
                'browser': session_row[3],
                'os': session_row[4],
                'logged_in_at': session_row[5].isoformat() if session_row[5] else None
            })
        
        accounts.append({
            'id': account_id,
            'login': login,
            'registered_at': registered_at.isoformat() if registered_at else None,
            'last_login': last_login.isoformat() if last_login else None,
            'token_used': token_used,
            'is_active': is_active,
            'sessions': sessions,
            'sessions_count': len(sessions)
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({
            'accounts': accounts,
            'total': len(accounts)
        })
    }
