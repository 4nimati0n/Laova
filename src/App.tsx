import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import MVPApp from './pages/MVPApp';
import Analytics from './pages/Analytics';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Safety from './pages/Safety';
import Success from './pages/Success';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC - Landing page */}
        <Route path="/" element={<Landing />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/safety" element={<Safety />} />

        {/* PRIVÉ - MVP (Protected) */}
        <Route path="/app" element={
          <ProtectedRoute>
            <MVPApp />
          </ProtectedRoute>
        } />

        {/* PRIVÉ - Analytics Dashboard (Protected) */}
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />

        {/* SUCCESS PAGE */}
        <Route path="/success" element={<Success />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
