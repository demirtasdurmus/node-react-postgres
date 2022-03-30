import React, { useState } from 'react';
import axios from 'axios';
import {
    Form,
    Input,
    Button,
    Row,
    Space,
    Select,
} from 'antd';
import alertNotification from "../../utils/alertNotification";


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
                    alertNotification('success', "Saved your skill successfully");
                };
            })
            .catch((err) => alertNotification('error', err.response.data.message))
    };

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
                    <Button type="primary" shape="round" style={{ width: "100%" }}>
                        Submit
                    </Button>
                </Space>
            </Form>
        </Row>
    );
};