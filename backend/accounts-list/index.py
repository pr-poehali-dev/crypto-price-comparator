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
                'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Auth',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method not in ['GET', 'PUT', 'DELETE']:
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
    
    # PUT method - изменение пароля аккаунта
    if method == 'PUT':
        body = json.loads(event.get('body', '{}'))
        account_id = body.get('id')
        new_password = body.get('password')
        
        if not account_id or not new_password:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Account ID and new password required'})
            }
        
        # Проверяем существование
        cur.execute(
            "SELECT login FROM t_p37207906_crypto_price_compara.platform_users WHERE id = %s",
            (account_id,)
        )
        account = cur.fetchone()
        
        if not account:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Account not found'})
            }
        
        login = account[0]
        
        # Обновляем пароль
        cur.execute(
            "UPDATE t_p37207906_crypto_price_compara.platform_users SET password = %s WHERE id = %s",
            (new_password, account_id)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'message': f'Пароль для аккаунта {login} изменен',
                'account': {'id': int(account_id), 'login': login}
            })
        }
    
    # DELETE method - удаление аккаунта
    if method == 'DELETE':
        params = event.get('queryStringParameters', {}) or {}
        account_id = params.get('id')
        
        if not account_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Account ID required'})
            }
        
        # Проверяем существование
        cur.execute(
            "SELECT login FROM t_p37207906_crypto_price_compara.platform_users WHERE id = %s",
            (account_id,)
        )
        account = cur.fetchone()
        
        if not account:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Account not found'})
            }
        
        login = account[0]
        
        # Удаляем сессии
        cur.execute(
            "DELETE FROM t_p37207906_crypto_price_compara.user_sessions WHERE user_id = %s",
            (account_id,)
        )
        
        # Удаляем сам аккаунт
        cur.execute(
            "DELETE FROM t_p37207906_crypto_price_compara.platform_users WHERE id = %s",
            (account_id,)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'message': f'Аккаунт {login} удален',
                'deleted': {'id': int(account_id), 'login': login}
            })
        }
    
    cur.execute("""
        SELECT 
            id, 
            login,
            password,
            registered_at, 
            last_login, 
            token_used, 
            is_active 
        FROM t_p37207906_crypto_price_compara.platform_users 
        ORDER BY registered_at DESC
    """)
    
    accounts = []
    for row in cur.fetchall():
        account_id, login, password, registered_at, last_login, token_used, is_active = row
        
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
            'password': password,
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