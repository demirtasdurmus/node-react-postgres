import { createContext } from 'react';
import useCheckAuth from '../hooks/useCheckAuth';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const { user, setUser, isLoading } = useCheckAuth();

    return (
        <UserContext.Provider value={{ user, setUser, isLoading }}>
            {children}
        </UserContext.Provider>
    )
};