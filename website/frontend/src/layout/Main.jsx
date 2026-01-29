import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home.jsx";
import About from "../pages/About.jsx";
import Contact from "../pages/Contact.jsx";
import Profile from "../pages/Profile.jsx";
import Login from "../pages/Login.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Main = () => {
  const { user } = useAuth();
  return (
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {user ? (
          <>
            <Route path="/profile" element={<Profile />} />
            <Route path="/logout" element={<Home />} />
          </>
        ) : (
          <Route path="/login" element={<Login />} />
        )}
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </main>
  );
};

export default Main;
