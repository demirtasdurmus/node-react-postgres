import './assets/style/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';

// routers
import PrivateRoute from './routers/PrivateRoute';
import PublicRoute from './routers/PublicRoute';

// pages
import About from './pages/About';
import Contact from './pages/Contact';
import Home from './pages/Home';
import UserSkills from "./pages/UserSkills";
import SignIn from "./pages/signIn";
import SignUp from "./pages/signUp";


function App() {

  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />

          <Route path="/" element={<PublicRoute />}>
            <Route index element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          <Route path="/" element={<PrivateRoute />}>
            <Route path="/skills" element={<UserSkills />} />
          </Route>
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
};

export default App;
