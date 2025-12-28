import json
import os
import psycopg2
import secrets
import string
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Управление токенами регистрации: создание, список, удаление
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Auth',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    admin_auth = headers.get('x-admin-auth') or headers.get('X-Admin-Auth')
    
    if admin_auth != 'maga:magamaga1010':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    if method == 'GET':
        cur.execute("SELECT token, login, created_at, used, used_at FROM tokens ORDER BY created_at DESC")
        tokens = []
        for row in cur.fetchall():
            tokens.append({
                'token': row[0],
                'login': row[1],
                'created_at': row[2].isoformat() if row[2] else None,
                'used': row[3],
                'used_at': row[4].isoformat() if row[4] else None
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'tokens': tokens})
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        login = body_data.get('login')
        password = body_data.get('password')
        
        if not login or not password:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Login and password required'})
            }
        
        token = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
        
        try:
            cur.execute(
                "INSERT INTO tokens (token, login, password) VALUES (%s, %s, %s) RETURNING token",
                (token, login, password)
            )
            conn.commit()
            
            result = {
                'success': True,
                'token': token,
                'login': login,
                'register_url': f'/register?token={token}'
            }
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps(result)
            }
        except psycopg2.IntegrityError:
            conn.rollback()
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Login already exists'})
            }
    
    if method == 'DELETE':
        params = event.get('queryStringParameters', {})
        token = params.get('token')
        
        if not token:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Token required'})
            }
        
        cur.execute("DELETE FROM tokens WHERE token = %s", (token,))
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': True})
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Method not allowed'})
    }