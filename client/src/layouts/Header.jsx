import React, { useContext } from 'react';
import { UserContext } from "../context/UserContext";
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Col } from 'antd';


export default function Header() {
    const { logoutUser } = useAuth();
    const { user } = useContext(UserContext);

    return (
        <div style={{ width: '100%', height: '5rem', backgroundColor: '#c4c4c4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

            <Col offset={2} span={2} style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                <Link to="/">Home</Link>
            </Col>

            <Col offset={2} span={2} style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                <Link to="/contact">Contact</Link>
            </Col>

            <Col offset={2} span={2} style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                <Link to="/about">About</Link>
            </Col>

            <Col offset={2} span={4} style={{ fontSize: '1.3rem', fontWeight: 'bold', display: 'flex', flexDirection: 'row' }}>
                {user && user.id ? `${user.first_name} ${user.last_name}` : <Link to="/sign-in">Sign In</Link>}
                {(user && user.id) && <button onClick={logoutUser} style={{ borderRadius: "20px", border: "none" }}>Logout</button>}
            </Col>
        </div>
    )
};
