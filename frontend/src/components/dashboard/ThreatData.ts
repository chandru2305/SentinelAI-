// Mock threat activity data
export interface ThreatActivity {
  id: string;
  time: string;
  threat: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'blocked' | 'detected' | 'investigating' | 'resolved';
  source: string;
}

export const mockThreatActivity: ThreatActivity[] = [
  { id: '1', time: '12:47:32', threat: 'Prompt Injection Attack', severity: 'critical', status: 'blocked', source: '185.220.101.45' },
  { id: '2', time: '12:41:19', threat: 'SQL Injection Attempt', severity: 'high', status: 'blocked', source: '104.21.73.22' },
  { id: '3', time: '12:35:58', threat: 'Brute Force Attack', severity: 'medium', status: 'investigating', source: '91.108.4.18' },
  { id: '4', time: '12:28:11', threat: 'Malware Upload Detected', severity: 'critical', status: 'blocked', source: '178.62.194.28' },
  { id: '5', time: '12:22:44', threat: 'XSS Injection', severity: 'medium', status: 'blocked', source: '203.0.113.8' },
  { id: '6', time: '12:15:03', threat: 'Phishing Campaign', severity: 'high', status: 'detected', source: '185.107.56.12' },
  { id: '7', time: '12:08:27', threat: 'Data Exfiltration Attempt', severity: 'critical', status: 'blocked', source: '45.77.190.22' },
  { id: '8', time: '11:57:54', threat: 'Port Scan Detected', severity: 'low', status: 'resolved', source: '192.168.1.105' },
  { id: '9', time: '11:44:12', threat: 'DDoS Attack Attempt', severity: 'high', status: 'blocked', source: '188.241.83.96' },
  { id: '10', time: '11:38:09', threat: 'Ransomware Signature', severity: 'critical', status: 'blocked', source: '95.217.163.246' },
];
