import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Token {
  token: string;
  login: string;
  created_at: string;
  used: boolean;
  used_at: string | null;
}

interface TokenManagementProps {
  tokens: Token[];
  onCreateClick: () => void;
  onCopyToken: (token: string) => void;
  onDeleteToken: (token: string) => void;
}

export function TokenManagement({ tokens, onCreateClick, onCopyToken, onDeleteToken }: TokenManagementProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Key" size={20} className="text-primary" />
              Токены регистрации ({tokens.length})
            </CardTitle>
            <CardDescription>Управление доступом к платформе</CardDescription>
          </div>
          <Button onClick={onCreateClick} size="sm">
            <Icon name="Plus" size={16} className="mr-2" />
            Создать
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tokens.map((token) => (
            <div key={token.token} className="p-3 border border-border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium">{token.login}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(token.created_at).toLocaleDateString('ru')}
                  </div>
                </div>
                <Badge variant={token.used ? 'secondary' : 'default'}>
                  {token.used ? 'Использован' : 'Активен'}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onCopyToken(token.token)}
                  className="flex-1"
                >
                  <Icon name="Copy" size={14} className="mr-1" />
                  Копировать ссылку
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onDeleteToken(token.token)}
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            </div>
          ))}
          {tokens.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="Key" size={48} className="mx-auto mb-2 opacity-20" />
              <p>Нет токенов</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
