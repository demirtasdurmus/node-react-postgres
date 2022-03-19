import React, { useContext } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { UserContext } from "../context/UserContext";
import DashboardLayout from '../layouts/DashboardLayout';
import Loading from "../components/helpers/Loading";


export default function PublicRoute(props) {
    const { user, isLoading } = useContext(UserContext);
    let location = useLocation();

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
    return <Navigate to="/" state={{ from: location }} replace />;
};