import './assets/style/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';

// routers
import PrivateRoute from './routers/PrivateRoute';

// pages
import Home from './pages/Home';
import UserSkills from "./pages/UserSkills";
import SignIn from "./pages/signIn";
import SignUp from "./pages/signUp";


function App() {

  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />

          <Route path="/" element={<PrivateRoute />}>
            <Route path="/skills" element={<UserSkills />} />
          </Route>
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
};

export default App;
