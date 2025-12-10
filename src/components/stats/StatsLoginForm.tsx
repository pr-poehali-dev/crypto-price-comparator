import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface StatsLoginFormProps {
  loginForm: { login: string; password: string };
  setLoginForm: (form: { login: string; password: string }) => void;
  onLogin: (e: React.FormEvent) => void;
}

export function StatsLoginForm({ loginForm, setLoginForm, onLogin }: StatsLoginFormProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Icon name="Lock" size={48} className="mx-auto mb-4 text-primary" />
          <CardTitle className="text-2xl">Вход в админ-панель</CardTitle>
          <CardDescription>Введите логин и пароль</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onLogin} className="space-y-4">
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
