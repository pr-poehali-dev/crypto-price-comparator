import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

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

interface ActiveSessionsProps {
  sessions: Session[];
  onUpdateSchemes: () => void;
}

export function ActiveSessions({ sessions, onUpdateSchemes }: ActiveSessionsProps) {
  const activeSessions = sessions.filter(
    s => !s.loggedOutAt && new Date(s.loggedInAt).getTime() > Date.now() - 300000
  );

  return (
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
          <Button onClick={onUpdateSchemes} size="sm" variant="outline">
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Обновить связки
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activeSessions.map((session) => (
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
          {activeSessions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="UserX" size={48} className="mx-auto mb-2 opacity-20" />
              <p>Нет активных сессий</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
