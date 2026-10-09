export interface Service {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  latency: string;
  description?: string;
}

export interface Incident {
  date: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  duration: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface StatusData {
  uptime: number;
  services: Service[];
  incidents: Incident[];
  uptime_history?: Array<{ date: string; uptime: number }>;
  last_updated?: string;
}
