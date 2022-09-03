import { useState, useEffect, useRef } from 'react';
import createHttpClient from '../utils/createHttpClient';
import authService from '../services/authService';


export default function useCheckAuth() {
    // create a new user service instance
    const { request } = useRef(createHttpClient()).current;
    const service = new authService(request);

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
                //console.log("check auth", err.response.data.message);
                localStorage.removeItem('r-token');
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            })
    };

    //  lifecycle
    useEffect(() => {
        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { user, setUser, isLoading }
};