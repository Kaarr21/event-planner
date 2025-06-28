import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import EventList from './components/Events/EventList';
import EventDetail from './components/Events/EventDetail';
import EventForm from './components/Events/EventForm';
import PastEvents from './components/Events/PastEvents';
import ProtectedRoute from './components/common/ProtectedRoute';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/events" replace />} />
              <Route path="/events" element={
                <ProtectedRoute>
                  <EventList />
                </ProtectedRoute>
              } />
              <Route path="/events/:id" element={
                <ProtectedRoute>
                  <EventDetail />
                </ProtectedRoute>
              } />
              <Route path="/events/:id/edit" element={
                <ProtectedRoute>
                  <EventForm />
                </ProtectedRoute>
              } />
              <Route path="/create-event" element={
                <ProtectedRoute>
                  <EventForm />
                </ProtectedRoute>
              } />
              <Route path="/past-events" element={
                <ProtectedRoute>
                  <PastEvents />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
