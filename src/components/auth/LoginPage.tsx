import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import ChatAssistant from '@/components/ChatAssistant';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === 'mmm' && password === '1234') {
      localStorage.setItem('isAuthenticated', 'true');
      onLogin();
    } else {
      setError('Неверный логин или пароль. Используйте mmm / 1234');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/50 backdrop-blur border-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Icon name="TrendingUp" size={32} className="text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl">CryptoArbitrage Pro</CardTitle>
          <CardDescription>Логин: mmm / Пароль: 1234</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Логин</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите логин"
                className="text-base"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="text-base"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                <Icon name="AlertCircle" size={16} className="text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}
            <Button type="submit" className="w-full" size="lg">
              <Icon name="LogIn" size={20} className="mr-2" />
              Войти
            </Button>
          </form>
        </CardContent>
      </Card>
      <ChatAssistant />
    </div>
  );
};