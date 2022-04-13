import { useState, useEffect } from 'react';
import alertNotification from '../utils/alertNotification';


export default function useErrorHandler() {

    // state declaration
    const [error, setError] = useState(null);

    // get user's auth status
    const handleError = () => {
        if (error.response.status === 401) {
            localStorage.removeItem('r-token');
            window.location.assign('/sign-in');
        } else if (error.response.status === 403) {
            localStorage.removeItem('r-token');
            window.location.assign('/satin-al');
        } else {
            alertNotification('error', error.response.data.message)
        }
    };

    const jsonError = JSON.stringify(error);

    //  lifecycle
    useEffect(() => {
        JSON.parse(jsonError) && handleError();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jsonError]);

    return { setError }
};