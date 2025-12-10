import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface Session {
  ip_address: string;
  user_agent: string;
  device_type: string;
  browser: string;
  os: string;
  logged_in_at: string;
}

interface Account {
  id: number;
  login: string;
  registered_at: string;
  last_login: string | null;
  token_used: string | null;
  is_active: boolean;
  sessions: Session[];
  sessions_count: number;
}

interface AccountsListProps {
  accounts: Account[];
}

export function AccountsList({ accounts }: AccountsListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Users" size={20} className="text-primary" />
          Все аккаунты ({accounts.length})
        </CardTitle>
        <CardDescription>Список зарегистрированных пользователей и история их подключений</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {accounts.map((account) => (
            <div key={account.id} className="border border-border rounded-lg overflow-hidden">
              <div 
                className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedId(expandedId === account.id ? null : account.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-lg">{account.login}</div>
                    <div className="text-xs text-muted-foreground space-y-1 mt-1">
                      <div className="flex items-center gap-1">
                        <Icon name="Calendar" size={12} />
                        Регистрация: {new Date(account.registered_at).toLocaleString('ru')}
                      </div>
                      {account.last_login && (
                        <div className="flex items-center gap-1">
                          <Icon name="Clock" size={12} />
                          Последний вход: {new Date(account.last_login).toLocaleString('ru')}
                        </div>
                      )}
                      {account.token_used && (
                        <div className="flex items-center gap-1">
                          <Icon name="Key" size={12} />
                          Через токен
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={account.is_active ? 'default' : 'secondary'}>
                      {account.is_active ? 'Активен' : 'Неактивен'}
                    </Badge>
                    <Icon 
                      name={expandedId === account.id ? 'ChevronUp' : 'ChevronDown'} 
                      size={20} 
                      className="text-muted-foreground"
                    />
                  </div>
                </div>

                {account.sessions_count > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <Icon name="Monitor" size={12} className="inline mr-1" />
                    {account.sessions_count} {account.sessions_count === 1 ? 'подключение' : 'подключений'}
                  </div>
                )}
              </div>

              {expandedId === account.id && account.sessions.length > 0 && (
                <div className="border-t border-border bg-muted/20 p-3">
                  <div className="text-sm font-medium mb-2">История подключений:</div>
                  <div className="space-y-2">
                    {account.sessions.map((session, idx) => (
                      <div key={idx} className="text-xs bg-background p-2 rounded border border-border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Icon name="Wifi" size={12} />
                              <span className="font-mono">{session.ip_address}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground mt-1">
                              <Icon name="Clock" size={12} />
                              {new Date(session.logged_in_at).toLocaleString('ru')}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Icon name="Smartphone" size={12} />
                              {session.device_type}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground mt-1">
                              <Icon name="Chrome" size={12} />
                              {session.browser} · {session.os}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expandedId === account.id && account.sessions.length === 0 && (
                <div className="border-t border-border bg-muted/20 p-3 text-center text-sm text-muted-foreground">
                  Нет истории подключений
                </div>
              )}
            </div>
          ))}

          {accounts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="Users" size={48} className="mx-auto mb-2 opacity-20" />
              <p>Нет зарегистрированных аккаунтов</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
