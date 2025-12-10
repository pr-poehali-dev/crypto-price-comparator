import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { getAllSessions, getOnlineCount, getTotalSessions, UserSession } from '@/lib/analytics';
import { useToast } from '@/hooks/use-toast';

const ADMIN_LOGIN = 'magome';
const ADMIN_PASSWORD = '28122007';

const LocalAdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const authStatus = sessionStorage.getItem('local_admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      loadStats();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        loadStats();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadStats = () => {
    const allSessions = getAllSessions();
    setSessions(allSessions);
    setOnlineCount(getOnlineCount());
    setTotalSessions(getTotalSessions());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('local_admin_authenticated', 'true');
      loadStats();
      toast({
        title: 'Успешный вход',
        description: 'Добро пожаловать в админ-панель',
      });
    } else {
      toast({
        title: 'Ошибка входа',
        description: 'Неверный логин или пароль',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('local_admin_authenticated');
    setLogin('');
    setPassword('');
  };

  const getDeviceIcon = (device: string) => {
    if (device === 'Mobile') return 'Smartphone';
    if (device === 'Tablet') return 'Tablet';
    return 'Monitor';
  };

  const getDeviceStats = () => {
    const stats = sessions.reduce((acc, session) => {
      acc[session.device] = (acc[session.device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  const getBrowserStats = () => {
    const stats = sessions.reduce((acc, session) => {
      acc[session.browser] = (acc[session.browser] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  const getOSStats = () => {
    const stats = sessions.reduce((acc, session) => {
      acc[session.os] = (acc[session.os] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="ShieldCheck" size={32} className="text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Админ-панель</CardTitle>
            <CardDescription className="text-center">
              Введите логин и пароль для доступа
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login">Логин</Label>
                <Input
                  id="login"
                  type="text"
                  placeholder="Введите логин"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <Icon name="LogIn" size={16} className="mr-2" />
                Войти
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const deviceStats = getDeviceStats();
  const browserStats = getBrowserStats();
  const osStats = getOSStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="ShieldCheck" size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Админ-панель</h1>
              <p className="text-sm text-muted-foreground">Статистика пользователей в реальном времени</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
          <Card className="bg-green-500/10 border-green-500/30">
            <CardHeader className="pb-3">
              <CardDescription>Онлайн сейчас</CardDescription>
              <CardTitle className="text-4xl text-green-500 flex items-center gap-2">
                <Icon name="Users" size={32} />
                {onlineCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-muted-foreground">Активных пользователей</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardHeader className="pb-3">
              <CardDescription>Всего сессий</CardDescription>
              <CardTitle className="text-4xl text-blue-500 flex items-center gap-2">
                <Icon name="Activity" size={32} />
                {totalSessions}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <Icon name="TrendingUp" size={16} className="text-blue-500" />
                <span className="text-muted-foreground">За всё время</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardHeader className="pb-3">
              <CardDescription>Уникальных IP</CardDescription>
              <CardTitle className="text-4xl text-purple-500 flex items-center gap-2">
                <Icon name="MapPin" size={32} />
                {new Set(sessions.map(s => s.ip)).size}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <Icon name="Globe" size={16} className="text-purple-500" />
                <span className="text-muted-foreground">Разных адресов</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="Monitor" size={20} />
                Устройства
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(deviceStats).map(([device, count]) => (
                <div key={device} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name={getDeviceIcon(device)} size={16} className="text-primary" />
                    <span className="text-sm">{device}</span>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
              {Object.keys(deviceStats).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Нет данных</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="Globe" size={20} />
                Браузеры
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(browserStats).map(([browser, count]) => (
                <div key={browser} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="Chrome" size={16} className="text-primary" />
                    <span className="text-sm">{browser}</span>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
              {Object.keys(browserStats).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Нет данных</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="Settings" size={20} />
                Операционные системы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(osStats).map(([os, count]) => (
                <div key={os} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="Cpu" size={16} className="text-primary" />
                    <span className="text-sm">{os}</span>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
              {Object.keys(osStats).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Нет данных</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Users" size={24} />
              Активные сессии
            </CardTitle>
            <CardDescription>
              Все пользователи онлайн прямо сейчас (обновляется каждые 3 секунды)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Icon name="Users" size={48} className="text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">Нет активных пользователей</p>
                <p className="text-sm text-muted-foreground">Ожидание подключений...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <Card key={session.id} className="bg-card/50 border-border">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Icon name={getDeviceIcon(session.device)} size={20} className="text-primary" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Badge variant="outline" className="bg-primary/10">
                                <Icon name="MapPin" size={12} className="mr-1" />
                                {session.ip}
                              </Badge>
                              <Badge variant="outline">
                                <Icon name={getDeviceIcon(session.device)} size={12} className="mr-1" />
                                {session.device}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                              <span>{session.browser}</span>
                              <span>•</span>
                              <span>{session.os}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <div className="flex items-center gap-1 text-xs text-green-500">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span>Онлайн</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Активен: {session.lastActive.toLocaleTimeString('ru-RU')}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LocalAdminPanel;
