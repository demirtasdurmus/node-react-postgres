import React, { useEffect, useState, useRef } from 'react';
import { Row, Col } from 'antd';
import createHttpClient from '../utils/createHttpClient';
import useErrorHandler from '../hooks/useErrorHandler';
import userService from '../services/userService';
import SkillAdd from "../components/skills/SkillAdd";
import SkillList from "../components/skills/SkillList";


export default function UserSkills() {
    // create a new user service instance
    const { request, controller } = useRef(createHttpClient()).current;
    const service = new userService(request);
    const { setError } = useErrorHandler();
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
                if (err.response) setError(err);
            })
            .finally(() => {
                !controller.signal.aborted && setIsLoading(false);
            })
    };

    //  lifecycle
    useEffect(() => {
        getUserSkills();
        return () => {
            controller.abort();
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
                        getUserSkills={getUserSkills}
                    />
                </Col>
            </Row>
            {content}
        </React.Fragment>
    )
};
