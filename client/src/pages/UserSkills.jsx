import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import createChannel from '../utils/createChannel';
import userService from '../services/userService';
import SkillAdd from "../components/skills/SkillAdd";
import SkillList from "../components/skills/SkillList";
import alertNotification from "../utils/alertNotification";

const channel = createChannel();


export default function UserSkills() {
    // create a new user service instance
    const service = new userService(channel.request);
    // state declaration
    const [userSkills, setUserSkills] = useState([]);

    // get all user skills to list
    const getUserSkills = () => {
        service.getUserSkills()
            .then((res) => {
                setUserSkills(res.data.data)
            })
            .catch((err) => alertNotification("error", err.response.data.message))
    };

    //  lifecycle
    useEffect(() => {
        getUserSkills();
        return () => {
            channel.controller.abort();
        }
    }, []);

    return (
        <React.Fragment  >
            <Row style={{ marginTop: '5rem' }}>
                <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
                    <SkillAdd
                        channel={channel}
                        getUserSkills={getUserSkills}
                    />
                </Col>
            </Row>
            <Row>
                <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
                    <SkillList
                        channel={channel}
                        userSkills={userSkills}
                        getUserSkills={getUserSkills}
                    />
                </Col>

            </Row>

        </React.Fragment>

    )
};
