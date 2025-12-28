import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { StatsLoginForm } from '@/components/stats/StatsLoginForm';
import { StatsOverview } from '@/components/stats/StatsOverview';
import { TokenManagement } from '@/components/stats/TokenManagement';
import { ActiveSessions } from '@/components/stats/ActiveSessions';
import { DirectAccountCreation } from '@/components/stats/DirectAccountCreation';
import { AccountsList } from '@/components/stats/AccountsList';

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
const CREATE_ACCOUNT_API = 'https://functions.poehali.dev/76822941-3815-4621-940e-c15a704b8226';
const ACCOUNTS_API = 'https://functions.poehali.dev/08158565-7845-44d8-94d7-96ac866ccb45';

export default function StatsPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [tokens, setTokens] = useState<Token[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newToken, setNewToken] = useState({ login: '', password: '' });
  const [createdToken, setCreatedToken] = useState<string>('');

  useEffect(() => {
    const auth = localStorage.getItem('statsAuth');
    if (auth === 'maga:magamaga1010') {
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
    if (loginForm.login === 'maga' && loginForm.password === 'magamaga1010') {
      localStorage.setItem('statsAuth', 'maga:magamaga1010');
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
    await Promise.all([loadTokens(), loadSessions(), loadAccounts()]);
    setLoading(false);
  };

  const loadTokens = async () => {
    try {
      const response = await fetch(TOKEN_API, {
        headers: { 'X-Admin-Auth': 'maga:magamaga1010' }
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

  const loadAccounts = async () => {
    try {
      const response = await fetch(ACCOUNTS_API, {
        headers: { 'X-Admin-Auth': 'maga:magamaga1010' }
      });
      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };

  const handleCreateToken = async () => {
    try {
      const response = await fetch(TOKEN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Auth': 'maga:magamaga1010'
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
        headers: { 'X-Admin-Auth': 'maga:magamaga1010' }
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

  const handleCreateDirectAccount = async (login: string, password: string) => {
    try {
      const response = await fetch(CREATE_ACCOUNT_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Auth': 'maga:magamaga1010'
        },
        body: JSON.stringify({ login, password })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Аккаунт создан!',
          description: `Логин: ${login}`
        });
        loadAccounts();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать аккаунт',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to create account:', error);
      toast({
        title: 'Ошибка',
        description: 'Ошибка сети',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAccount = async (accountId: number) => {
    try {
      const response = await fetch(`${ACCOUNTS_API}?id=${accountId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Auth': 'maga:magamaga1010'
        }
      });

      if (response.ok) {
        toast({
          title: 'Аккаунт удален!',
          description: 'Все данные аккаунта были удалены'
        });
        loadAccounts();
      } else {
        const data = await response.json();
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось удалить аккаунт',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast({
        title: 'Ошибка',
        description: 'Ошибка сети',
        variant: 'destructive'
      });
    }
  };

  const handleChangePassword = async (accountId: number, newPassword: string) => {
    try {
      const response = await fetch(ACCOUNTS_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Auth': 'maga:magamaga1010'
        },
        body: JSON.stringify({ id: accountId, password: newPassword })
      });

      if (response.ok) {
        toast({
          title: 'Пароль изменен!',
          description: 'Новый пароль сохранен'
        });
        loadAccounts();
      } else {
        const data = await response.json();
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось изменить пароль',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      toast({
        title: 'Ошибка',
        description: 'Ошибка сети',
        variant: 'destructive'
      });
    }
  };

  const onlineCount = sessions.filter(s => !s.loggedOutAt && 
    new Date(s.loggedInAt).getTime() > Date.now() - 300000).length;

  if (!isAuthenticated) {
    return (
      <StatsLoginForm 
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        onLogin={handleLogin}
      />
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

        <StatsOverview sessions={sessions} onlineCount={onlineCount} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TokenManagement 
            tokens={tokens}
            onCreateClick={() => setCreateModalOpen(true)}
            onCopyToken={copyToken}
            onDeleteToken={handleDeleteToken}
          />

          <ActiveSessions 
            sessions={sessions}
            onUpdateSchemes={handleUpdateSchemes}
          />
        </div>

        <DirectAccountCreation onCreateAccount={handleCreateDirectAccount} />

        <AccountsList accounts={accounts} onDeleteAccount={handleDeleteAccount} onChangePassword={handleChangePassword} />
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