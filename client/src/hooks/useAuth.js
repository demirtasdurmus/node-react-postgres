import { useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import createHttpClient from '../utils/createHttpClient';
import authService from '../services/authService';
import { UserContext } from '../context/UserContext';
import alertNotification from "../utils/alertNotification";


export default function useAuth() {
    // create a new user service instance
    const { request } = useRef(createHttpClient()).current;
    const service = new authService(request);
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    //set user in context and push them home
    const setUserContext = (redirectPage) => {
        service.checkUserAuth()
            .then(res => {
                setUser(res.data.data);
                navigate(redirectPage ? redirectPage : '/skills');
            })
            .catch((err) => {
                alertNotification("error", err.response.data.message);
                navigate('/sign-in');
            })
    };

    const registerUser = (values) => {
        service.registerUser(values)
            .then((res) => {
                alertNotification("success", "Registered successfully. Please verify your email address.");
            })
            .catch((err) => {
                alertNotification("error", err.response.data.message)
            });
    };

    const loginUser = (values, redirectPage) => {
        service.loginUser(values)
            .then((res) => {
                setUserContext(redirectPage);
                localStorage.setItem('r-token', res.data.data.token);
                //alertNotification("success", "Logged in successfully");
            })
            .catch((err) => {
                alertNotification("error", err.response.data.message)
            });
    };

    const logoutUser = () => {
        service.logoutUser()
            .then((res) => {
                setUser(null);
                localStorage.removeItem('r-token');
                //alertNotification("success", "Logged out successfully");
            })
            .catch((err) => {
                alertNotification("error", err.response.data.message)
            });
    };
    return {
        registerUser,
        loginUser,
        logoutUser
    };
};