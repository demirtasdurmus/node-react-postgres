import { useState, useEffect } from 'react';
import alertNotification from '../utils/alertNotification';


export default function useErrorHandler() {

    // state declaration
    const [error, setError] = useState(null);

    // get user's auth status
    const handleError = () => {
        if (error.response) {
            if (error.response.status === 401) {
                window.location.assign('/sign-in');
            } else if (error.response.status === 403) {
                window.location.assign('/satin-al');
            } else {
                alertNotification('error', error.response.data.message)
            }
        } else {
            // log error to console
            console.log(error)
        }

    };

    const jsonError = JSON.stringify(error);

    //  lifecycle
    useEffect(() => {
        JSON.parse(jsonError) && handleError();
    }, [jsonError]);

    return { setError }
};