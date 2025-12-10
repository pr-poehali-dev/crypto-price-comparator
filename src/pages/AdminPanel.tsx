import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

interface User {
  id: number;
  email: string;
  fullName: string;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Session {
  id: number;
  userId: number;
  email: string;
  fullName: string;
  ipAddress: string;
  userAgent: string;
  deviceType: string;
  browser: string;
  os: string;
  country: string;
  city: string;
  loggedInAt: string;
  loggedOutAt: string | null;
}

const USERS_API = 'https://functions.poehali.dev/c7982c7b-49dd-47aa-8acf-96814a731b34';
const SESSIONS_API = 'https://functions.poehali.dev/ca8a9e5c-1c6d-4b11-88e4-c740f3f6c840';
const AUTH_API = 'https://functions.poehali.dev/6d6d395c-ce79-4019-a7e4-409eb5297447';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    fullName: '',
    isAdmin: false
  });

  useEffect(() => {
    checkAuth();
    
    // Автообновление каждые 5 минут
    const intervalId = setInterval(() => {
      loadUsers();
      loadSessions();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const checkAuth = async () => {
    const sessionToken = localStorage.getItem('sessionToken');
    
    if (!sessionToken) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(AUTH_API, {
        method: 'GET',
        headers: { 'X-Session-Token': sessionToken }
      });

      if (!response.ok) {
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      loadUsers();
      loadSessions();
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/login');
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(USERS_API);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async (userId?: number) => {
    try {
      const url = userId ? `${SESSIONS_API}?userId=${userId}` : SESSIONS_API;
      const response = await fetch(url);
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch(USERS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      
      if (response.ok) {
        setCreateModalOpen(false);
        setNewUser({ email: '', password: '', fullName: '', isAdmin: false });
        loadUsers();
      }
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await fetch(USERS_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, isActive: !user.isActive })
      });
      loadUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Вы уверены, что хотите удалить пользователя ${user.email}? Это действие необратимо и удалит все его аккаунты, токены и сессии.`)) {
      return;
    }

    try {
      const response = await fetch(`${USERS_API}?id=${user.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        loadUsers();
        loadSessions();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error || 'Не удалось удалить пользователя'}`);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Произошла ошибка при удалении пользователя');
    }
  };

  const handleFilterSessions = (userId: number | null) => {
    setSelectedUserId(userId);
    if (userId) {
      loadSessions(userId);
    } else {
      loadSessions();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="RefreshCw" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  const handleLogout = async () => {
    const sessionToken = localStorage.getItem('sessionToken');
    
    if (sessionToken) {
      try {
        await fetch(AUTH_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Token': sessionToken
          },
          body: JSON.stringify({ action: 'logout' })
        });
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
    
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Админ-панель</h1>
            <p className="text-muted-foreground mt-2">Управление пользователями и мониторинг активности</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleLogout}>
              <Icon name="LogOut" size={20} className="mr-2" />
              Выход
            </Button>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Icon name="UserPlus" size={20} className="mr-2" />
              Создать пользователя
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Users" size={24} className="text-primary" />
              Пользователи ({users.length})
            </CardTitle>
            <CardDescription>Управление учетными записями</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Имя</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Админ</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Статус</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Создан</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="py-3 px-4">{user.id}</td>
                      <td className="py-3 px-4 font-medium">{user.email}</td>
                      <td className="py-3 px-4">{user.fullName || '-'}</td>
                      <td className="py-3 px-4">
                        {user.isAdmin ? (
                          <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">Да</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">Нет</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {user.isActive ? (
                          <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded">Активен</span>
                        ) : (
                          <span className="px-2 py-1 bg-destructive/20 text-destructive text-xs rounded">Отключен</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="py-3 px-4 text-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFilterSessions(user.id)}
                        >
                          <Icon name="Activity" size={14} className="mr-1" />
                          Сессии
                        </Button>
                        <Button
                          size="sm"
                          variant={user.isActive ? 'destructive' : 'default'}
                          onClick={() => handleToggleActive(user)}
                        >
                          {user.isActive ? 'Отключить' : 'Включить'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Icon name="Trash2" size={14} className="mr-1" />
                          Удалить
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        Нет пользователей. Создайте первого пользователя.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Activity" size={24} className="text-accent" />
                  История входов ({sessions.length})
                </CardTitle>
                <CardDescription>
                  {selectedUserId ? (
                    <>Сессии пользователя #{selectedUserId}</>
                  ) : (
                    <>Все входы на платформу</>
                  )}
                </CardDescription>
              </div>
              {selectedUserId && (
                <Button variant="outline" onClick={() => handleFilterSessions(null)}>
                  Показать все
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Пользователь</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">IP адрес</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Устройство</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Браузер</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ОС</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Время входа</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="py-3 px-4">
                        <div className="font-medium">{session.email}</div>
                        <div className="text-xs text-muted-foreground">{session.fullName || '-'}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">{session.ipAddress}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-muted text-xs rounded">{session.deviceType}</span>
                      </td>
                      <td className="py-3 px-4">{session.browser}</td>
                      <td className="py-3 px-4">{session.os}</td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(session.loggedInAt).toLocaleString('ru-RU')}
                      </td>
                    </tr>
                  ))}
                  {sessions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        Нет записей о входах
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать пользователя</DialogTitle>
              <DialogDescription>Добавить новую учетную запись</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="fullName">Полное имя (необязательно)</Label>
                <Input
                  id="fullName"
                  placeholder="Иван Иванов"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isAdmin">Администратор</Label>
                <Switch
                  id="isAdmin"
                  checked={newUser.isAdmin}
                  onCheckedChange={(checked) => setNewUser({ ...newUser, isAdmin: checked })}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setCreateModalOpen(false)} className="flex-1">
                  Отмена
                </Button>
                <Button onClick={handleCreateUser} className="flex-1">
                  <Icon name="UserPlus" size={16} className="mr-2" />
                  Создать
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}