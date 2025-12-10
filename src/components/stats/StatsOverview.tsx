import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface StatsOverviewProps {
  sessions: Session[];
  onlineCount: number;
}

export function StatsOverview({ sessions, onlineCount }: StatsOverviewProps) {
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

  return (
    <>
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
    </>
  );
}
