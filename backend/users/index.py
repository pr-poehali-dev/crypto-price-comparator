import json
import os
import hashlib
import secrets
from typing import Dict, Any, Optional, List
from datetime import datetime
import psycopg2
import psycopg2.extras

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Управление пользователями: создание, получение списка, обновление, деактивация.
    Позволяет администраторам управлять учетными записями пользователей.
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    admin_token = headers.get('X-Admin-Token') or headers.get('x-admin-token')
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    
    try:
        if method == 'GET':
            return get_users(conn, event)
        elif method == 'POST':
            return create_user(conn, event)
        elif method == 'PUT':
            return update_user(conn, event)
        elif method == 'DELETE':
            return deactivate_user(conn, event)
        else:
            return error_response(405, 'Method not allowed')
    finally:
        conn.close()

def get_users(conn, event: Dict[str, Any]) -> Dict[str, Any]:
    '''Получить список всех пользователей'''
    params = event.get('queryStringParameters', {}) or {}
    user_id = params.get('id')
    
    with conn.cursor() as cur:
        if user_id:
            cur.execute('''
                SELECT id, email, full_name, is_active, is_admin, created_at, updated_at
                FROM users WHERE id = %s
            ''', (user_id,))
            row = cur.fetchone()
            if not row:
                return error_response(404, 'User not found')
            
            user = {
                'id': row[0],
                'email': row[1],
                'fullName': row[2],
                'isActive': row[3],
                'isAdmin': row[4],
                'createdAt': row[5].isoformat() if row[5] else None,
                'updatedAt': row[6].isoformat() if row[6] else None
            }
            return success_response({'user': user})
        else:
            cur.execute('''
                SELECT id, email, full_name, is_active, is_admin, created_at, updated_at
                FROM users ORDER BY created_at DESC
            ''')
            rows = cur.fetchall()
            
            users = []
            for row in rows:
                users.append({
                    'id': row[0],
                    'email': row[1],
                    'fullName': row[2],
                    'isActive': row[3],
                    'isAdmin': row[4],
                    'createdAt': row[5].isoformat() if row[5] else None,
                    'updatedAt': row[6].isoformat() if row[6] else None
                })
            
            return success_response({'users': users, 'total': len(users)})

def create_user(conn, event: Dict[str, Any]) -> Dict[str, Any]:
    '''Создать нового пользователя'''
    body = json.loads(event.get('body', '{}'))
    email = body.get('email')
    password = body.get('password')
    full_name = body.get('fullName')
    is_admin = body.get('isAdmin', False)
    
    if not email or not password:
        return error_response(400, 'Email and password required')
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    with conn.cursor() as cur:
        cur.execute('''
            SELECT id FROM users WHERE email = %s
        ''', (email,))
        if cur.fetchone():
            return error_response(409, 'User already exists')
        
        cur.execute('''
            INSERT INTO users (email, password_hash, full_name, is_admin)
            VALUES (%s, %s, %s, %s)
            RETURNING id, email, full_name, is_active, is_admin, created_at
        ''', (email, password_hash, full_name, is_admin))
        
        row = cur.fetchone()
        conn.commit()
        
        user = {
            'id': row[0],
            'email': row[1],
            'fullName': row[2],
            'isActive': row[3],
            'isAdmin': row[4],
            'createdAt': row[5].isoformat() if row[5] else None
        }
        
        return success_response({'user': user, 'message': 'User created successfully'}, 201)

def update_user(conn, event: Dict[str, Any]) -> Dict[str, Any]:
    '''Обновить данные пользователя'''
    body = json.loads(event.get('body', '{}'))
    user_id = body.get('id')
    
    if not user_id:
        return error_response(400, 'User ID required')
    
    updates = []
    values = []
    
    if 'email' in body:
        updates.append('email = %s')
        values.append(body['email'])
    if 'fullName' in body:
        updates.append('full_name = %s')
        values.append(body['fullName'])
    if 'isActive' in body:
        updates.append('is_active = %s')
        values.append(body['isActive'])
    if 'isAdmin' in body:
        updates.append('is_admin = %s')
        values.append(body['isAdmin'])
    if 'password' in body:
        password_hash = hashlib.sha256(body['password'].encode()).hexdigest()
        updates.append('password_hash = %s')
        values.append(password_hash)
    
    updates.append('updated_at = CURRENT_TIMESTAMP')
    values.append(user_id)
    
    with conn.cursor() as cur:
        query = f'''
            UPDATE users 
            SET {', '.join(updates)}
            WHERE id = %s
            RETURNING id, email, full_name, is_active, is_admin, updated_at
        '''
        cur.execute(query, values)
        row = cur.fetchone()
        
        if not row:
            return error_response(404, 'User not found')
        
        conn.commit()
        
        user = {
            'id': row[0],
            'email': row[1],
            'fullName': row[2],
            'isActive': row[3],
            'isAdmin': row[4],
            'updatedAt': row[5].isoformat() if row[5] else None
        }
        
        return success_response({'user': user, 'message': 'User updated successfully'})

def deactivate_user(conn, event: Dict[str, Any]) -> Dict[str, Any]:
    '''Деактивировать пользователя'''
    params = event.get('queryStringParameters', {}) or {}
    user_id = params.get('id')
    
    if not user_id:
        return error_response(400, 'User ID required')
    
    with conn.cursor() as cur:
        cur.execute('''
            UPDATE users 
            SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, email
        ''', (user_id,))
        row = cur.fetchone()
        
        if not row:
            return error_response(404, 'User not found')
        
        conn.commit()
        
        return success_response({'message': f'User {row[1]} deactivated successfully'})

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