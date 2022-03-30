import React from 'react';
import { Layout } from 'antd';
import Header from "./Header";


export default function DashboardLayout({ children }) {
    return (
        <Layout>
            <Header />
            {children}
        </Layout>
    )
};
