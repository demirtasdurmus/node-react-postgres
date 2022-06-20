import React, { useContext } from 'react';
import { UserContext } from "../context/UserContext";
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Col } from 'antd';


export default function Header() {
    const { logoutUser } = useAuth();
    const { user } = useContext(UserContext);

    return (
        <div style={{ width: '100%', height: '5rem', backgroundColor: '#c4c4c4', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>

            <Col span={2} style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                <Link to="/">Home</Link>
            </Col>

            <Col span={2} style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                <Link to="/contact">Contact</Link>
            </Col>

            <Col span={2} style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                <Link to="/about">About</Link>
            </Col>

            <Col span={2} style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                <Link to="/skills">Skills</Link>
            </Col>

            <Col span={5} style={{ fontSize: '1.3rem', fontWeight: 'bold', display: 'flex', flexDirection: 'row', justifyContent: "end" }}>
                {user && user.id ? <h4 style={{ margin: "auto" }}>{user.firstName} {user.lastName}</h4> : <Link style={{ margin: "auto" }} to="/sign-in">Sign In</Link>}
                {user && user.id ? <img src={user.profileImg} alt="profileImg" style={{ borderRadius: "55px", height: "4rem" }} /> : null}
                {(user && user.id) && <button onClick={logoutUser} style={{ marginLeft: "2rem", borderRadius: "20px", border: "none" }}>Logout</button>}
            </Col>
        </div>
    )
};
