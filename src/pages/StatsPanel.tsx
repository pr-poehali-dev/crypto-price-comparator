import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Token {
  token: string;
  login: string;
  created_at: string;
  used: boolean;
  used_at: string | null;
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

const TOKEN_API = 'https://functions.poehali.dev/ce69afd3-021e-4761-9e5b-df896ff09470';
const SESSIONS_API = 'https://functions.poehali.dev/ca8a9e5c-1c6d-4b11-88e4-c740f3f6c840';
const UPDATE_API = 'https://functions.poehali.dev/e6aad3a0-ee00-44a7-b76a-abd8dccde072';

export default function StatsPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [tokens, setTokens] = useState<Token[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newToken, setNewToken] = useState({ login: '', password: '' });
  const [createdToken, setCreatedToken] = useState<string>('');

  useEffect(() => {
    const auth = localStorage.getItem('statsAuth');
    if (auth === 'magome:28122007') {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(loadSessions, 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.login === 'magome' && loginForm.password === '28122007') {
      localStorage.setItem('statsAuth', 'magome:28122007');
      setIsAuthenticated(true);
      loadData();
    } else {
      toast({
        title: 'Ошибка входа',
        description: 'Неверный логин или пароль',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('statsAuth');
    setIsAuthenticated(false);
    setLoginForm({ login: '', password: '' });
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadTokens(), loadSessions()]);
    setLoading(false);
  };

  const loadTokens = async () => {
    try {
      const response = await fetch(TOKEN_API, {
        headers: { 'X-Admin-Auth': 'magome:28122007' }
      });
      const data = await response.json();
      setTokens(data.tokens || []);
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await fetch(SESSIONS_API);
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const handleCreateToken = async () => {
    try {
      const response = await fetch(TOKEN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Auth': 'magome:28122007'
        },
        body: JSON.stringify(newToken)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCreatedToken(data.token);
        toast({
          title: 'Токен создан!',
          description: `Логин: ${data.login}`
        });
        loadTokens();
        setNewToken({ login: '', password: '' });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать токен',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to create token:', error);
      toast({
        title: 'Ошибка',
        description: 'Ошибка сети',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteToken = async (token: string) => {
    try {
      const response = await fetch(`${TOKEN_API}?token=${token}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Auth': 'magome:28122007' }
      });
      
      if (response.ok) {
        toast({ title: 'Токен удален' });
        loadTokens();
      }
    } catch (error) {
      console.error('Failed to delete token:', error);
    }
  };

  const handleUpdateSchemes = async () => {
    try {
      toast({ title: 'Обновление связок...', description: 'Это может занять несколько секунд' });
      const response = await fetch(UPDATE_API);
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Связки обновлены!',
          description: `Создано: ${data.new_schemes}, Удалено: ${data.deleted_schemes}`
        });
      }
    } catch (error) {
      console.error('Failed to update schemes:', error);
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/register?token=${token}`);
    toast({ title: 'Ссылка скопирована!' });
  };

  const onlineCount = sessions.filter(s => !s.loggedOutAt && 
    new Date(s.loggedInAt).getTime() > Date.now() - 300000).length;

  const deviceStats = sessions.reduce((acc, s) => {
    acc[s.deviceType] = (acc[s.deviceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const browserStats = sessions.reduce((acc, s) => {
    acc[s.browser] = (acc[s.browser] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const osStats = sessions.reduce((acc, s) => {
    acc[s.os] = (acc[s.os] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Icon name="Lock" size={48} className="mx-auto mb-4 text-primary" />
            <CardTitle className="text-2xl">Вход в админ-панель</CardTitle>
            <CardDescription>Введите логин и пароль</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login">Логин</Label>
                <Input
                  id="login"
                  type="text"
                  value={loginForm.login}
                  onChange={(e) => setLoginForm({ ...loginForm, login: e.target.value })}
                  placeholder="magome"
                />
              </div>
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full">
                <Icon name="LogIn" size={20} className="mr-2" />
                Войти
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <Icon name="BarChart3" size={36} className="text-primary" />
              Статистика платформы
            </h1>
            <p className="text-muted-foreground mt-2">Мониторинг пользователей и токенов</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              <Icon name="Home" size={20} className="mr-2" />
              На главную
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <Icon name="LogOut" size={20} className="mr-2" />
              Выход
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                Онлайн сейчас
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{onlineCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Icon name="Users" size={16} className="text-primary" />
                Всего сессий
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{sessions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Icon name="Globe" size={16} className="text-primary" />
                Уникальных IP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {new Set(sessions.map(s => s.ipAddress)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Устройства</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(deviceStats).map(([device, count]) => (
                <div key={device} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{device}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Браузеры</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(browserStats).map(([browser, count]) => (
                <div key={browser} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{browser}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">ОС</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(osStats).map(([os, count]) => (
                <div key={os} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{os}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <Button onClick={() => setCreateModalOpen(true)} size="sm">
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
                        onClick={() => copyToken(token.token)}
                        className="flex-1"
                      >
                        <Icon name="Copy" size={14} className="mr-1" />
                        Копировать ссылку
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteToken(token.token)}
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

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Activity" size={20} className="text-accent" />
                    Активные сессии
                  </CardTitle>
                  <CardDescription>Последние 5 минут</CardDescription>
                </div>
                <Button onClick={handleUpdateSchemes} size="sm" variant="outline">
                  <Icon name="RefreshCw" size={16} className="mr-2" />
                  Обновить связки
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sessions
                  .filter(s => !s.loggedOutAt && new Date(s.loggedInAt).getTime() > Date.now() - 300000)
                  .map((session) => (
                    <div key={session.id} className="p-3 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{session.ipAddress}</div>
                          <div className="text-xs text-muted-foreground">
                            {session.deviceType} • {session.browser} • {session.os}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(session.loggedInAt).toLocaleString('ru')}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                          <span className="text-xs text-accent font-medium">Онлайн</span>
                        </div>
                      </div>
                    </div>
                  ))}
                {sessions.filter(s => !s.loggedOutAt).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="UserX" size={48} className="mx-auto mb-2 opacity-20" />
                    <p>Нет активных сессий</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать токен регистрации</DialogTitle>
            <DialogDescription>
              Токен будет содержать логин и пароль для нового пользователя
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="newLogin">Логин</Label>
              <Input
                id="newLogin"
                value={newToken.login}
                onChange={(e) => setNewToken({ ...newToken, login: e.target.value })}
                placeholder="username"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">Пароль</Label>
              <Input
                id="newPassword"
                type="password"
                value={newToken.password}
                onChange={(e) => setNewToken({ ...newToken, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            {createdToken && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">Ссылка для регистрации:</div>
                <div className="text-xs break-all text-muted-foreground">
                  {window.location.origin}/register?token={createdToken}
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => copyToken(createdToken)}
                >
                  <Icon name="Copy" size={14} className="mr-2" />
                  Копировать
                </Button>
              </div>
            )}
            <Button 
              onClick={handleCreateToken} 
              disabled={!newToken.login || !newToken.password}
              className="w-full"
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Создать токен
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
