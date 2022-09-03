import React, { useState, useEffect, useRef } from 'react';
import {
    Form,
    Input,
    Button,
    Col,
    Space,
    Select,
} from 'antd';
import userService from '../../services/userService';
import alertNotification from "../../utils/alertNotification";
import createHttpClient from "../../utils/createHttpClient";
import useErrorHandler from '../../hooks/useErrorHandler';


export default function SkillUpdate(props) {
    const { Option } = Select;
    const { getUserSkills, toggleModal, skillId } = props;

    // create a new user service instance
    const { request, controller } = useRef(createHttpClient()).current;
    const service = new userService(request);

    const { setError } = useErrorHandler();

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
        service.updateUserSkill(inputs)
            .then((res) => {
                if (res.data.status === "success") {
                    getUserSkills();
                    toggleModal();
                    alertNotification('success', "Updated your skill successfully");
                };
            })
            .catch((err) => {
                if (err.response) setError(err);
            })
    };

    // get a skill by id to update
    const getSkillById = (id) => {
        service.getUserSkillById(id)
            .then((res) => {
                setInputs({
                    id: res.data.data.id,
                    category: res.data.data.category,
                    tagLine: res.data.data.tagLine,
                    travelFee: res.data.data.travelFee,
                    locationOptions: res.data.data.locationOptions.map(e => e.option),
                })
            })
            .catch((err) => {
                if (err.response) setError(err);
            })
    };

    useEffect(() => {
        getSkillById(skillId);
        return () => {
            controller.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                        <Button htmlType='submit' type="primary" shape="round">
                            Update
                        </Button>
                    </Space>
                </Form>
            </Col>
        </React.Fragment>
    )
};