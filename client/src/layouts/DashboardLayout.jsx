import React from 'react';
import { Layout } from 'antd';
import Header from "./Header";
import SiderX from "./sider/SiderX";
const { Footer } = Layout;


export default function DashboardLayout({ children }) {
    return (
        <Layout>
            <SiderX />
            <Layout>
                <Header />
                {children}
                {/*<Footer>Footer</Footer>*/}
            </Layout>
        </Layout>
    )
};
