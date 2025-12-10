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
  password: string;
  registered_at: string;
  last_login: string | null;
  token_used: string | null;
  is_active: boolean;
  sessions: Session[];
  sessions_count: number;
}

interface AccountsListProps {
  accounts: Account[];
  onDeleteAccount?: (accountId: number) => void;
  onChangePassword?: (accountId: number, newPassword: string) => void;
}

export function AccountsList({ accounts, onDeleteAccount, onChangePassword }: AccountsListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());
  const [editingPasswordId, setEditingPasswordId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');

  const togglePasswordVisibility = (accountId: number) => {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }
      return next;
    });
  };

  const handleDelete = (account: Account) => {
    if (confirm(`Вы уверены, что хотите удалить аккаунт "${account.login}"? Это действие необратимо.`)) {
      onDeleteAccount?.(account.id);
    }
  };

  const startEditPassword = (account: Account) => {
    setEditingPasswordId(account.id);
    setNewPassword(account.password);
  };

  const savePassword = (accountId: number) => {
    if (newPassword.trim()) {
      onChangePassword?.(accountId, newPassword);
      setEditingPasswordId(null);
      setNewPassword('');
    }
  };

  const cancelEdit = () => {
    setEditingPasswordId(null);
    setNewPassword('');
  };

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
                        <Icon name="Lock" size={12} />
                        Пароль: 
                        {editingPasswordId === account.id ? (
                          <div className="flex items-center gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="font-mono text-xs px-1 py-0.5 border rounded w-24 bg-background text-foreground"
                              autoFocus
                            />
                            <button
                              onClick={() => savePassword(account.id)}
                              className="hover:text-green-500 transition-colors"
                              title="Сохранить"
                            >
                              <Icon name="Check" size={12} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="hover:text-red-500 transition-colors"
                              title="Отменить"
                            >
                              <Icon name="X" size={12} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="font-mono ml-1">
                              {visiblePasswords.has(account.id) ? account.password : '••••••••'}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePasswordVisibility(account.id);
                              }}
                              className="ml-1 hover:text-foreground transition-colors"
                            >
                              <Icon name={visiblePasswords.has(account.id) ? 'EyeOff' : 'Eye'} size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditPassword(account);
                              }}
                              className="ml-1 hover:text-foreground transition-colors"
                              title="Изменить пароль"
                            >
                              <Icon name="Edit2" size={12} />
                            </button>
                          </>
                        )}
                      </div>
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(account);
                      }}
                      className="p-1.5 hover:bg-destructive/20 rounded transition-colors text-destructive"
                      title="Удалить аккаунт"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
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