import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import MVPApp from './pages/MVPApp';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Safety from './pages/Safety';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC - Landing page */}
        <Route path="/" element={<Landing />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/safety" element={<Safety />} />

        {/* PRIVÉ - MVP */}
        <Route path="/app" element={<MVPApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
