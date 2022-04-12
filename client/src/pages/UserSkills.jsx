import React, { useEffect, useState, useRef } from 'react';
import { Row, Col } from 'antd';
import createChannel from '../utils/createChannel';
import userService from '../services/userService';
import SkillAdd from "../components/skills/SkillAdd";
import SkillList from "../components/skills/SkillList";
import alertNotification from "../utils/alertNotification";


export default function UserSkills() {
    // create a new user service instance
    const channel = useRef(createChannel());
    const apiRequest = channel.current.request;
    const apiController = channel.current.controller;
    const service = new userService(apiRequest);
    let content;
    // state declaration
    const [isLoading, setIsLoading] = useState(true);
    const [userSkills, setUserSkills] = useState([]);

    // get all user skills to list
    const getUserSkills = () => {
        setIsLoading(true);
        service.getUserSkills()
            .then((res) => {
                setUserSkills(res.data.data)
            })
            .catch((err) => {
                alertNotification("error", err.response.data.message)
            })
            .finally(() => {
                !apiController.signal.aborted && setIsLoading(false);
            })
    };

    //  lifecycle
    useEffect(() => {
        getUserSkills();
        return () => {
            apiController.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isLoading) {
        content = <div>Loading...</div>
    } else {
        content =
            <Row>
                <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
                    <SkillList
                        apiRequest={apiRequest}
                        userSkills={userSkills}
                        getUserSkills={getUserSkills}
                    />
                </Col>
            </Row>
    };

    return (
        <React.Fragment  >
            <Row style={{ marginTop: '5rem' }}>
                <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
                    <SkillAdd
                        apiRequest={apiRequest}
                        getUserSkills={getUserSkills}
                    />
                </Col>
            </Row>
            {content}
        </React.Fragment>
    )
};
