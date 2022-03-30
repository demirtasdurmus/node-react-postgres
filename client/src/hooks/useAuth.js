import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import createChannel from '../utils/createChannel';
import userService from '../services/userService';
import { UserContext } from '../context/UserContext';
import alertNotification from "../utils/alertNotification";

const channel = createChannel();

export default function useAuth() {
    // create a new user service instance
    const service = new userService(channel.request);
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    //set user in context and push them home
    const setUserContext = (redirectPage) => {
        service.checkUserAuth()
            .then(res => {
                setUser(res.data.data);
                navigate(redirectPage ? redirectPage : '/');
            })
            .catch((err) => {
                console.log(err.response.data.message);
                navigate('/sign-in');
            })
    };

    const registerUser = (values) => {
        service.registerUser(values)
            .then(() => {
                //setUserContext();
                navigate('/sign-in');
            })
            .catch((err) => {
                alertNotification("error", err.response.data.message)
            });
    };

    const loginUser = (values, redirectPage) => {
        service.loginUser(values)
            .then((res) => {
                setUserContext(redirectPage);
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