import React, { useState, useEffect } from 'react';
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


export default function SkillUpdate(props) {
    const { Option } = Select;
    const { getUserSkills, toggleModal, skillId } = props;

    const [inputs, setInputs] = useState({
        id: null,
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

    // update a skill
    const handleUpdateSkill = () => {
        axios.put(`/api/v1/skills/${inputs.id}`, {
            category: inputs.category,
            tagLine: inputs.tagLine,
            travelFee: inputs.travelFee,
            locationOptions: inputs.locationOptions,
        })
            .then((res) => {
                if (res.data.status === "success") {
                    getUserSkills();
                    toggleModal();
                    Notification('success', "Updated your skill successfully");
                };
            })
            .catch((err) => Notification('error', err.response.data.message))
    };

    // get a skill by id to update
    const getSkillById = (id) => {
        axios.get(`/api/v1/skills/${id}`)
            .then((res) => {
                setInputs({
                    id: res.data.data.id,
                    category: res.data.data.category,
                    tagLine: res.data.data.tag_line,
                    travelFee: res.data.data.travel_fee,
                    locationOptions: res.data.data.location_options.map(e => e.option),
                })
            })
            .catch((err) => Notification('error', err.response.data.message))
    };

    useEffect(() => {
        getSkillById(skillId)
    }, [skillId])

    return (
        <React.Fragment>
            <Col span={24} offset={5}>
                <h1 >Add new Skill</h1>
                <Form
                    name="basic"
                    // labelCol={{ span: 2 }}
                    // wrapperCol={{ span: 2 }}
                    // initialValues={{ remember: true }}
                    onFinish={handleUpdateSkill}
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
                            value={inputs.category}
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
                            value={inputs.tagLine}
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
                            value={inputs.travelFee}
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
                            onChange={handleLocationOptions}
                            value={inputs.locationOptions}
                            optionLabelProp="label"
                        >
                            <Option value="choose" label="choose">
                                <div className="demo-option-label-item">
                                    Choose
                                </div>
                            </Option>
                            <Option value="instructor" label="instructor">
                                <div className="demo-option-label-item">
                                    Instructor
                                </div>
                            </Option>
                            <Option value="online" label="online">
                                <div className="demo-option-label-item">
                                    Online
                                </div>
                            </Option>
                        </Select>
                        <Button type="primary" htmlType="submit" shape="round">
                            Update
                        </Button>
                    </Space>
                </Form>
            </Col>
        </React.Fragment>
    )
};