import { BrowserRouter } from "react-router-dom";
import Header from "./layout/Header.jsx";
import Footer from "./layout/Footer.jsx";
import Navbar from "./layout/Navbar.jsx";
import Main from "./layout/Main.jsx";
import "./styles/App.css";
import { AuthProvider } from "./context/AuthContext.jsx";
function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Header />
          <Main />
          <Footer />
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
