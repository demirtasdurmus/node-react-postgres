import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
// import { useNavigate } from 'react-router-dom';


export default function useCheckAuth() {
    // const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [isLoading, setLoading] = useState(true);

    const checkAuth = () => {
        axios.get("/api/v1/auth/check-auth")
            .then(res => {
                if (res.data.status === "success") setUser(res.data.data);
            })
            .catch(() => {
                Cookies.remove('__session');
                // window.location.replace("/")
            })
            .finally(() => {
                setLoading(false);
            })
    };

    useEffect(() => {
        checkAuth();
    }, []);
    return {
        user,
        setUser,
        isLoading
    }
};