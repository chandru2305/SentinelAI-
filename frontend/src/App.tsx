import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedLayout from './layouts/auth/ProtectedLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardHome from './pages/Dashboard/DashboardHome';
import ThreatMonitor from './pages/Dashboard/ThreatMonitor';
import AIAnalysis from './pages/Dashboard/AIAnalysis';
import ThreatAnalyzer from './pages/AI/ThreatAnalyzer';
import ModelStatus from './pages/AI/ModelStatus';
import Playground from './pages/AI/Playground';
import AIModels from './pages/AI/AIModels';
import AIScan from './pages/AI/AIScan';
import ThreatDetection from './pages/Detection/ThreatDetection';
import ThreatRules from './pages/Detection/ThreatRules';
import ThreatHistory from './pages/Detection/ThreatHistory';
import ThreatIntelligence from './pages/Detection/ThreatIntelligence';
import ThreatStatistics from './pages/Detection/ThreatStatistics';
import DetectionCenter from './pages/Detection/DetectionCenter';
import Reports from './pages/Dashboard/Reports';
import ActivityLogs from './pages/Dashboard/ActivityLogs';
import Settings from './pages/Dashboard/Settings';
import Profile from './pages/Dashboard/Profile';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected dashboard routes */}
        <Route element={<ProtectedLayout />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            
            <Route path="/ai-models" element={<AIModels />} />
            <Route path="/ai-scanner" element={<AIScan />} />
            <Route path="/detection-center" element={<DetectionCenter />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/activity-logs" element={<ActivityLogs />} />
            <Route path="/settings" element={<Settings />} />

            <Route path="/threat-monitor" element={<ThreatMonitor />} />
            <Route path="/incidents" element={<ThreatMonitor />} />
            <Route path="/ai-analysis" element={<AIAnalysis />} />
            <Route path="/threat-analyzer" element={<ThreatAnalyzer />} />
            <Route path="/ai-status" element={<ModelStatus />} />
            <Route path="/ai-playground" element={<Playground />} />
            <Route path="/detection" element={<ThreatDetection />} />
            <Route path="/detection/rules" element={<ThreatRules />} />
            <Route path="/detection/history" element={<ThreatHistory />} />
            <Route path="/detection/intelligence" element={<ThreatIntelligence />} />
            <Route path="/detection/statistics" element={<ThreatStatistics />} />
            <Route path="/threat-intel" element={<AIAnalysis />} />
            
            <Route path="/logs" element={<Navigate to="/activity-logs" replace />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Catch-all → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

