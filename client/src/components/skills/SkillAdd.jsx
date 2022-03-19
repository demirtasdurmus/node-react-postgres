import React, { useState } from 'react';
import axios from 'axios';
import {
    Form,
    Input,
    Button,
    Col,
    Space,
    Select,
} from 'antd';
import Notification from "../helpers/Notification";


export default function SkillAdd(props) {
    const { Option } = Select;
    const { getUserSkills } = props;

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
        // e.preventDefault();
        axios.post("/api/v1/skills", {
            category: inputs.category,
            tagLine: inputs.tagLine,
            travelFee: inputs.travelFee,
            locationOptions: inputs.locationOptions,
        })
            .then((res) => {
                if (res.data.status === "success") {
                    getUserSkills();
                    Notification('success', "Saved your skill successfully");
                };
            })
            .catch((err) => Notification('error', err.response.data.message))
    };

    return (
        <React.Fragment>
            <Col span={24}>
                <h1 >Add new Skill</h1>
                <Form
                    name="basic"
                    // labelCol={{ span: 2 }}
                    // wrapperCol={{ span: 2 }}
                    // initialValues={{ remember: true }}
                    onFinish={handleAddSkill}
                    // onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Space direction="vertical">
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
                        <Button type="primary" htmlType="submit" shape="round">
                            Submit
                        </Button>
                    </Space>
                </Form>
            </Col>
        </React.Fragment>
    );
};