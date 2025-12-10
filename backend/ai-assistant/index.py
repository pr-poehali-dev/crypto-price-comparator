import json
import os
from typing import Dict, Any, List
from openai import OpenAI

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    AI-помощник для админ-панели: отвечает на вопросы с контекстом истории диалога
    Args: event - dict с httpMethod, body (message, history)
    Returns: HTTP response с ответом нейросети
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Auth',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    headers = event.get('headers', {})
    auth = headers.get('X-Admin-Auth') or headers.get('x-admin-auth')
    
    if auth != 'magome:28122007':
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    user_message: str = body_data.get('message', '')
    history: List[Dict[str, str]] = body_data.get('history', [])
    
    if not user_message:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Message is required'})
        }
    
    client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])
    
    messages = [
        {
            'role': 'system',
            'content': '''Ты — AI-помощник администратора системы "Космо". 
Твоя задача: отвечать на вопросы о работе системы, помогать с настройкой, объяснять функционал.

Контекст системы:
- Система управления пользователями через токены регистрации
- Админ создаёт токены с логином/паролем и сроком действия
- Пользователи регистрируются по токенам или через прямое создание
- Есть мониторинг сессий, IP-адресов, устройств
- База данных PostgreSQL с таблицами: tokens, users, sessions
- Backend на Python, Frontend на React

Отвечай кратко, по делу, дружелюбно. Используй эмодзи для наглядности.
Если вопрос не по теме системы — вежливо напомни о своей специализации.'''
        }
    ]
    
    for msg in history[-10:]:
        messages.append({
            'role': msg.get('role', 'user'),
            'content': msg.get('content', '')
        })
    
    messages.append({
        'role': 'user',
        'content': user_message
    })
    
    response = client.chat.completions.create(
        model='gpt-4o-mini',
        messages=messages,
        temperature=0.7,
        max_tokens=1000
    )
    
    assistant_reply = response.choices[0].message.content
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'reply': assistant_reply,
            'usage': {
                'prompt_tokens': response.usage.prompt_tokens,
                'completion_tokens': response.usage.completion_tokens,
                'total_tokens': response.usage.total_tokens
            }
        })
    }
