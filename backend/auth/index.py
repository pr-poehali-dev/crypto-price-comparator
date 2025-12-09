import json
import os
import hashlib
import secrets
from typing import Dict, Any
from datetime import datetime, timedelta
import psycopg2
import psycopg2.extras

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Аутентификация пользователей: вход, выход, проверка сессии.
    Создает сессии и токены для безопасного доступа к системе.
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
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', 'login')
            
            if action == 'logout':
                return logout(conn, event)
            else:
                return login(conn, event)
        elif method == 'GET':
            return verify_session(conn, event)
        else:
            return error_response(405, 'Method not allowed')
    finally:
        conn.close()

def login(conn, event: Dict[str, Any]) -> Dict[str, Any]:
    '''Вход пользователя в систему'''
    body = json.loads(event.get('body', '{}'))
    email = body.get('email')
    password = body.get('password')
    
    if not email or not password:
        return error_response(400, 'Email and password required')
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    with conn.cursor() as cur:
        cur.execute('''
            SELECT id, email, full_name, is_active, is_admin
            FROM users WHERE email = %s AND password_hash = %s
        ''', (email, password_hash))
        
        row = cur.fetchone()
        
        if not row:
            return error_response(401, 'Invalid credentials')
        
        user_id, email, full_name, is_active, is_admin = row
        
        if not is_active:
            return error_response(403, 'Account is disabled')
        
        headers = event.get('headers', {})
        request_context = event.get('requestContext', {})
        identity = request_context.get('identity', {})
        
        ip_address = identity.get('sourceIp', 'Unknown')
        user_agent = headers.get('User-Agent') or headers.get('user-agent', 'Unknown')
        
        device_type = parse_device_type(user_agent)
        browser = parse_browser(user_agent)
        os = parse_os(user_agent)
        
        session_token = secrets.token_urlsafe(32)
        
        cur.execute('''
            INSERT INTO user_sessions 
            (user_id, ip_address, user_agent, device_type, browser, os, session_token)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, logged_in_at
        ''', (user_id, ip_address, user_agent, device_type, browser, os, session_token))
        
        session_row = cur.fetchone()
        conn.commit()
        
        return success_response({
            'success': True,
            'sessionToken': session_token,
            'user': {
                'id': user_id,
                'email': email,
                'fullName': full_name,
                'isAdmin': is_admin
            },
            'sessionId': session_row[0],
            'loggedInAt': session_row[1].isoformat() if session_row[1] else None
        })

def logout(conn, event: Dict[str, Any]) -> Dict[str, Any]:
    '''Выход пользователя из системы'''
    headers = event.get('headers', {})
    session_token = headers.get('X-Session-Token') or headers.get('x-session-token')
    
    if not session_token:
        return error_response(400, 'Session token required')
    
    with conn.cursor() as cur:
        cur.execute('''
            UPDATE user_sessions 
            SET logged_out_at = CURRENT_TIMESTAMP
            WHERE session_token = %s AND logged_out_at IS NULL
            RETURNING id
        ''', (session_token,))
        
        row = cur.fetchone()
        
        if not row:
            return error_response(404, 'Session not found')
        
        conn.commit()
        
        return success_response({'success': True, 'message': 'Logged out successfully'})

def verify_session(conn, event: Dict[str, Any]) -> Dict[str, Any]:
    '''Проверка активной сессии'''
    headers = event.get('headers', {})
    session_token = headers.get('X-Session-Token') or headers.get('x-session-token')
    
    if not session_token:
        return error_response(401, 'Session token required')
    
    with conn.cursor() as cur:
        cur.execute('''
            SELECT s.id, s.user_id, u.email, u.full_name, u.is_admin, s.logged_in_at
            FROM user_sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.session_token = %s AND s.logged_out_at IS NULL AND u.is_active = TRUE
        ''', (session_token,))
        
        row = cur.fetchone()
        
        if not row:
            return error_response(401, 'Invalid or expired session')
        
        session_id, user_id, email, full_name, is_admin, logged_in_at = row
        
        return success_response({
            'valid': True,
            'user': {
                'id': user_id,
                'email': email,
                'fullName': full_name,
                'isAdmin': is_admin
            },
            'sessionId': session_id,
            'loggedInAt': logged_in_at.isoformat() if logged_in_at else None
        })

def parse_device_type(user_agent: str) -> str:
    ua_lower = user_agent.lower()
    if 'mobile' in ua_lower or 'android' in ua_lower or 'iphone' in ua_lower:
        return 'Mobile'
    elif 'tablet' in ua_lower or 'ipad' in ua_lower:
        return 'Tablet'
    else:
        return 'Desktop'

def parse_browser(user_agent: str) -> str:
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