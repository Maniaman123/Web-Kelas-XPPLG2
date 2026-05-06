import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthProvider from './context/AuthProvider';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import StudentProfileEdit from './pages/StudentProfileEdit';
import Projects from './pages/Projects';
import Cinematography from './pages/Cinematography';
import Achievements from './pages/Achievements';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-surface-alt font-sans selection:bg-secondary selection:text-primary flex flex-col">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/edit-profile" element={<StudentProfileEdit />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/cinematography" element={<Cinematography />} />
              <Route path="/achievements" element={<Achievements />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
