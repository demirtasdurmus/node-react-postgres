import React, { useState, useRef, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Row,
    Space,
    Select,
} from 'antd';
import userService from '../../services/userService';
import alertNotification from "../../utils/alertNotification";
import createHttpClient from "../../utils/createHttpClient";
import useErrorHandler from '../../hooks/useErrorHandler';


export default function SkillAdd(props) {
    const { Option } = Select;
    const { getUserSkills } = props;

    // create a new user service instance
    const { request, controller } = useRef(createHttpClient()).current;
    const service = new userService(request);

    const { setError } = useErrorHandler();

    // state declaration
    const [inputs, setInputs] = useState({
        category: "",
        locationOptions: [],
        tagLine: "",
        travelFee: null,
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setInputs({ ...inputs, [name]: value });
    };

    const handleLocationOptions = (value) => {
        setInputs({ ...inputs, locationOptions: value });
    };

    // create skill
    const handleAddSkill = (e) => {
        service.addUserSkill(inputs)
            .then((res) => {
                getUserSkills();
                alertNotification('success', "Saved your skill successfully");
            })
            .catch((err) => {
                if (err.response) setError(err);
            })
    };

    //  lifecycle
    useEffect(() => {
        return () => {
            controller.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Row style={{ marginBottom: "4rem" }}>
            <Form
                name="basic"
                onFinish={handleAddSkill}
                autoComplete="off"
            >
                <Space direction="vertical" style={{ display: "flex !important", justifyContent: "center" }}>
                    <Input
                        style={{
                            width: 300,
                        }}
                        size="small"
                        placeholder="Category"
                        name="category"
                        type="text"
                        onChange={handleInputChange}
                        allowClear
                    />
                    <Input
                        style={{
                            width: 300,
                        }}
                        size="small"
                        placeholder="Tagline"
                        name="tagLine"
                        type="text"
                        onChange={handleInputChange}
                        allowClear
                    />
                    <Input
                        style={{
                            width: 300,
                        }}
                        size="small"
                        placeholder="Travel Fee"
                        name="travelFee"
                        type="number"
                        min="0"
                        step="0.01"
                        onChange={handleInputChange}
                    />
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        size="small"
                        placeholder="select location"
                        name="locationOptions"
                        // defaultValue={['choose']}
                        onChange={handleLocationOptions}
                        optionLabelProp="label"
                    >
                        <Option value="choose" label="choose">
                            choose
                        </Option>
                        <Option value="instructor" label="instructor">
                            instructor
                        </Option>
                        <Option value="online" label="online">
                            online
                        </Option>
                    </Select>
                    <Button type="primary" htmlType='submit' shape="round" style={{ width: "100%" }}>
                        Submit
                    </Button>
                </Space>
            </Form>
        </Row>
    );
};