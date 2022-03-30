import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Col } from 'antd';
import SkillAdd from "../components/skills/SkillAdd";
import SkillList from "../components/skills/SkillList";
import Notification from "../utils/Notification";


export default function UserSkills() {
    // state declaration
    const [userSkills, setUserSkills] = useState([]);

    // get all user skills to list
    const getUserSkills = () => {
        axios.get("/api/v1/skills")
            .then((res) => {
                setUserSkills(res.data.data)
            })
            .catch((err) => Notification("error", err.response.data.message))
    };

    //  lifecycle
    useEffect(() => {
        getUserSkills();
    }, []);

    return (
        <React.Fragment>
            <Row>
                <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
                    <SkillAdd
                        getUserSkills={getUserSkills}
                    />
                </Col>
            </Row>
            <Row>
                <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
                    <SkillList
                        userSkills={userSkills}
                        getUserSkills={getUserSkills}
                    />
                </Col>

            </Row>

        </React.Fragment>

    )
};
