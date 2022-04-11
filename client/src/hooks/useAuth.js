import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import createChannel from '../utils/createChannel';
import authService from '../services/authService';
import { UserContext } from '../context/UserContext';
import alertNotification from "../utils/alertNotification";

const channel = createChannel();

export default function useAuth() {
    // create a new user service instance
    const service = new authService(channel.request);
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
                console.log(err.response.data.message);
                navigate('/sign-in');
            })
    };

    const registerUser = (values) => {
        service.registerUser(values)
            .then((res) => {
                alertNotification("success", res.data.message)
            })
            .catch((err) => {
                alertNotification("error", err.response.data.message)
            });
    };

    const loginUser = (values, redirectPage) => {
        service.loginUser(values)
            .then((res) => {
                setUserContext(redirectPage);
                alertNotification("success", "Logged in successfully");
            })
            .catch((err) => {
                alertNotification("error", err.response.data.message)
            });
    };

    const logoutUser = () => {
        service.logoutUser()
            .then((res) => {
                setUser(null);
                alertNotification("success", "Logged out successfully");
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
}