import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./layout/ProtectedRoute";
import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ServerDetails from "./pages/ServerDetails";
import BookingFlow from "./pages/BookingFlow";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OAuthCallback from "./pages/OAuthCallback";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import "./styles/global.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-shell">
          <Navbar />
          <main className="app-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/termekek" element={<Products />} />
              <Route path="/termekek/:id" element={<ServerDetails />} />
              <Route
                path="/termekek/:id/foglalas"
                element={
                  <ProtectedRoute>
                    <BookingFlow />
                  </ProtectedRoute>
                }
              />
              <Route path="/kapcsolat" element={<Contact />} />
              <Route path="/ugyfelportal/login" element={<Login />} />
              <Route path="/ugyfelportal/register" element={<Register />} />
              <Route path="/ugyfelportal/oauth/callback" element={<OAuthCallback />} />
              <Route
                path="/ugyfelportal/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ugyfelportal/profil"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
