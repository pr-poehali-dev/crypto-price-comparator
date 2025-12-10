import json
import os
from typing import Dict, Any, List
from openai import OpenAI

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    AI-помощник: отвечает на любые вопросы пользователей с контекстом диалога
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
            'content': '''Ты — дружелюбный AI-помощник, готовый помочь с любыми вопросами! 🤖

Ты можешь:
- Отвечать на общие вопросы
- Объяснять сложные темы простым языком
- Помогать с решением проблем
- Давать советы и рекомендации
- Поддерживать беседу на разные темы

Стиль общения:
- Дружелюбный и понятный
- Используй эмодзи для наглядности 
- Отвечай кратко и по существу
- Если не знаешь ответ — честно признайся

Будь полезным и позитивным помощником! ✨'''
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