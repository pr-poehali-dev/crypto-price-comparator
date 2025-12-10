import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const REGISTER_API = 'https://functions.poehali.dev/02e7a4df-5d7e-4fec-b1ec-db8dfbc2264c';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [userLogin, setUserLogin] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast({
        title: 'Ошибка',
        description: 'Токен не найден',
        variant: 'destructive'
      });
      return;
    }
    setTokenValid(true);
  }, [token]);

  const handleRegister = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(REGISTER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (response.ok) {
        setUserLogin(data.login);
        toast({
          title: 'Регистрация успешна!',
          description: `Добро пожаловать, ${data.login}`
        });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast({
          title: 'Ошибка регистрации',
          description: data.error || 'Не удалось зарегистрироваться',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: 'Ошибка',
        description: 'Ошибка сети',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-destructive/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Icon name="AlertTriangle" size={48} className="mx-auto mb-4 text-destructive" />
            <CardTitle className="text-2xl">Неверная ссылка</CardTitle>
            <CardDescription>Токен регистрации не найден</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              <Icon name="Home" size={20} className="mr-2" />
              На главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Icon name="CheckCircle2" size={48} className="mx-auto mb-4 text-accent animate-bounce" />
            <CardTitle className="text-2xl">Регистрация успешна!</CardTitle>
            <CardDescription>
              Вы зарегистрированы как <strong>{userLogin}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground mb-4">
              Перенаправление на страницу входа...
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              <Icon name="LogIn" size={20} className="mr-2" />
              Войти сейчас
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Icon name="UserPlus" size={48} className="mx-auto mb-4 text-primary" />
          <CardTitle className="text-2xl">Регистрация</CardTitle>
          <CardDescription>
            Нажмите кнопку ниже, чтобы завершить регистрацию
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Key" size={16} className="text-primary" />
              <span className="text-muted-foreground">Токен получен</span>
            </div>
          </div>
          
          <Button 
            onClick={handleRegister} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Icon name="RefreshCw" size={20} className="mr-2 animate-spin" />
                Регистрация...
              </>
            ) : (
              <>
                <Icon name="Check" size={20} className="mr-2" />
                Зарегистрироваться
              </>
            )}
          </Button>

          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="w-full"
          >
            <Icon name="Home" size={20} className="mr-2" />
            На главную
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
