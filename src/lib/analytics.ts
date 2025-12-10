export interface UserSession {
  id: string;
  ip: string;
  device: string;
  browser: string;
  os: string;
  lastActive: Date;
  joinedAt: Date;
}

const STORAGE_KEY = 'user_sessions';
const SESSION_TIMEOUT = 5 * 60 * 1000;

export const getDeviceInfo = (): { device: string; browser: string; os: string } => {
  const ua = navigator.userAgent;
  
  let device = 'Desktop';
  if (/mobile/i.test(ua)) device = 'Mobile';
  if (/tablet|ipad/i.test(ua)) device = 'Tablet';
  
  let browser = 'Unknown';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edge')) browser = 'Edge';
  
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS')) os = 'iOS';
  
  return { device, browser, os };
};

export const getIPAddress = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return 'Unknown';
  }
};

export const initSession = async (): Promise<string> => {
  const sessionId = localStorage.getItem('session_id') || `session_${Date.now()}_${Math.random()}`;
  localStorage.setItem('session_id', sessionId);
  
  const deviceInfo = getDeviceInfo();
  const ip = await getIPAddress();
  
  const session: UserSession = {
    id: sessionId,
    ip,
    ...deviceInfo,
    lastActive: new Date(),
    joinedAt: new Date()
  };
  
  updateSession(session);
  
  setInterval(() => {
    const updatedSession = { ...session, lastActive: new Date() };
    updateSession(updatedSession);
  }, 30000);
  
  return sessionId;
};

const updateSession = (session: UserSession) => {
  const sessions = getAllSessions();
  const index = sessions.findIndex(s => s.id === session.id);
  
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export const getAllSessions = (): UserSession[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const sessions: UserSession[] = JSON.parse(data);
    const now = Date.now();
    
    const activeSessions = sessions.filter(s => {
      const lastActive = new Date(s.lastActive).getTime();
      return now - lastActive < SESSION_TIMEOUT;
    });
    
    if (activeSessions.length !== sessions.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeSessions));
    }
    
    return activeSessions.map(s => ({
      ...s,
      lastActive: new Date(s.lastActive),
      joinedAt: new Date(s.joinedAt)
    }));
  } catch (error) {
    return [];
  }
};

export const getOnlineCount = (): number => {
  return getAllSessions().length;
};

export const getTotalSessions = (): number => {
  const allSessionsEver = localStorage.getItem('total_sessions_count');
  return allSessionsEver ? parseInt(allSessionsEver) : getAllSessions().length;
};

export const incrementTotalSessions = () => {
  const current = getTotalSessions();
  localStorage.setItem('total_sessions_count', (current + 1).toString());
};
