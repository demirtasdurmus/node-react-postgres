import { useState, useEffect } from 'react';
import createChannel from '../utils/createChannel';
import authService from '../services/authService';

const channel = createChannel();

export default function useCheckAuth() {
    // create a new user service instance
    const service = new authService(channel.request);

    // state declaration
    const [user, setUser] = useState(null);
    const [isLoading, setLoading] = useState(true);

    // get user's auth status
    const checkAuth = () => {
        service.checkUserAuth()
            .then(res => {
                setUser(res.data.data);
            })
            .catch((err) => {
                console.log(err.response.data.message);
                // window.location.replace("/")
            })
            .finally(() => {
                setLoading(false);
            })
    };

    //  lifecycle
    useEffect(() => {
        checkAuth();
        return () => {
            channel.controller.abort();
        }
    }, []);

    return {
        user,
        setUser,
        isLoading
    }
};