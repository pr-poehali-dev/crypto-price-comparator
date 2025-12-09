import json
import os
import secrets
from typing import Dict, Any
from datetime import datetime
import psycopg2
import psycopg2.extras

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Управление сессиями и отслеживание входов пользователей.
    Фиксирует IP, устройство, браузер, геолокацию при каждом входе.
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    
    try:
        if method == 'GET':
            return get_sessions(conn, event)
        elif method == 'POST':
            return create_session(conn, event)
        else:
            return error_response(405, 'Method not allowed')
    finally:
        conn.close()

def get_sessions(conn, event: Dict[str, Any]) -> Dict[str, Any]:
    '''Получить историю сессий с фильтрами'''
    params = event.get('queryStringParameters', {}) or {}
    user_id = params.get('userId')
    limit = int(params.get('limit', 100))
    
    with conn.cursor() as cur:
        if user_id:
            cur.execute('''
                SELECT 
                    s.id, s.user_id, u.email, u.full_name,
                    s.ip_address, s.user_agent, s.device_type, s.browser, s.os,
                    s.country, s.city, s.logged_in_at, s.logged_out_at
                FROM user_sessions s
                JOIN users u ON s.user_id = u.id
                WHERE s.user_id = %s
                ORDER BY s.logged_in_at DESC
                LIMIT %s
            ''', (user_id, limit))
        else:
            cur.execute('''
                SELECT 
                    s.id, s.user_id, u.email, u.full_name,
                    s.ip_address, s.user_agent, s.device_type, s.browser, s.os,
                    s.country, s.city, s.logged_in_at, s.logged_out_at
                FROM user_sessions s
                JOIN users u ON s.user_id = u.id
                ORDER BY s.logged_in_at DESC
                LIMIT %s
            ''', (limit,))
        
        rows = cur.fetchall()
        
        sessions = []
        for row in rows:
            sessions.append({
                'id': row[0],
                'userId': row[1],
                'email': row[2],
                'fullName': row[3],
                'ipAddress': row[4],
                'userAgent': row[5],
                'deviceType': row[6],
                'browser': row[7],
                'os': row[8],
                'country': row[9],
                'city': row[10],
                'loggedInAt': row[11].isoformat() if row[11] else None,
                'loggedOutAt': row[12].isoformat() if row[12] else None
            })
        
        return success_response({'sessions': sessions, 'total': len(sessions)})

def create_session(conn, event: Dict[str, Any]) -> Dict[str, Any]:
    '''Создать новую сессию при входе пользователя'''
    body = json.loads(event.get('body', '{}'))
    user_id = body.get('userId')
    
    if not user_id:
        return error_response(400, 'User ID required')
    
    headers = event.get('headers', {})
    request_context = event.get('requestContext', {})
    identity = request_context.get('identity', {})
    
    ip_address = identity.get('sourceIp', 'Unknown')
    user_agent = headers.get('User-Agent') or headers.get('user-agent', 'Unknown')
    
    device_type = parse_device_type(user_agent)
    browser = parse_browser(user_agent)
    os = parse_os(user_agent)
    
    session_token = secrets.token_urlsafe(32)
    
    with conn.cursor() as cur:
        cur.execute('''
            INSERT INTO user_sessions 
            (user_id, ip_address, user_agent, device_type, browser, os, session_token)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, logged_in_at
        ''', (user_id, ip_address, user_agent, device_type, browser, os, session_token))
        
        row = cur.fetchone()
        conn.commit()
        
        return success_response({
            'sessionId': row[0],
            'sessionToken': session_token,
            'loggedInAt': row[1].isoformat() if row[1] else None,
            'message': 'Session created successfully'
        }, 201)

def parse_device_type(user_agent: str) -> str:
    '''Определить тип устройства'''
    ua_lower = user_agent.lower()
    if 'mobile' in ua_lower or 'android' in ua_lower or 'iphone' in ua_lower:
        return 'Mobile'
    elif 'tablet' in ua_lower or 'ipad' in ua_lower:
        return 'Tablet'
    else:
        return 'Desktop'

def parse_browser(user_agent: str) -> str:
    '''Определить браузер'''
    ua = user_agent.lower()
    if 'edg' in ua:
        return 'Edge'
    elif 'chrome' in ua:
        return 'Chrome'
    elif 'firefox' in ua:
        return 'Firefox'
    elif 'safari' in ua and 'chrome' not in ua:
        return 'Safari'
    elif 'opera' in ua or 'opr' in ua:
        return 'Opera'
    else:
        return 'Other'

def parse_os(user_agent: str) -> str:
    '''Определить операционную систему'''
    ua = user_agent.lower()
    if 'windows' in ua:
        return 'Windows'
    elif 'mac' in ua:
        return 'macOS'
    elif 'linux' in ua:
        return 'Linux'
    elif 'android' in ua:
        return 'Android'
    elif 'iphone' in ua or 'ipad' in ua:
        return 'iOS'
    else:
        return 'Other'

def success_response(data: Dict[str, Any], status_code: int = 200) -> Dict[str, Any]:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(data),
        'isBase64Encoded': False
    }

def error_response(status_code: int, message: str) -> Dict[str, Any]:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': message}),
        'isBase64Encoded': False
    }