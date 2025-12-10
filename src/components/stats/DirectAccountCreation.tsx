import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface DirectAccountCreationProps {
  onCreateAccount: (login: string, password: string) => Promise<void>;
}

export function DirectAccountCreation({ onCreateAccount }: DirectAccountCreationProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login || !password) return;

    setIsCreating(true);
    try {
      await onCreateAccount(login, password);
      setLogin('');
      setPassword('');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="UserPlus" size={20} className="text-primary" />
          Прямое создание аккаунта
        </CardTitle>
        <CardDescription>Создать аккаунт без токена (для администраторов)</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Input
              placeholder="Логин"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              disabled={isCreating}
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isCreating}
            />
          </div>
          <Button 
            type="submit" 
            disabled={!login || !password || isCreating}
            className="w-full"
          >
            <Icon name="Plus" size={16} className="mr-2" />
            {isCreating ? 'Создание...' : 'Создать аккаунт'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
