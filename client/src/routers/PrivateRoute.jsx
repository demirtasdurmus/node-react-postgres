import React, { useContext } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { UserContext } from "../context/UserContext";
import DashboardLayout from '../layouts/DashboardLayout';
import Loading from "../components/shared/Loading";


export default function PrivateRoute(props) {
    const { user, isLoading } = useContext(UserContext);
    let location = useLocation();
    //console.log("private", location)

    if (isLoading) {
        return <Loading />
    };

    if (user) {
        return (
            <DashboardLayout>
                <Outlet />
            </DashboardLayout>
        )
    };
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
};