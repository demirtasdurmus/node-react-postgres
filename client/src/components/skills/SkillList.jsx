import React, { useState } from 'react';
import SkillUpdate from "./SkillUpdate";
import { Table, Tag, Space, Button, Modal } from 'antd';
import userService from '../../services/userService';
import alertNotification from "../../utils/alertNotification";
import useErrorHandler from '../../hooks/useErrorHandler';


export default function SkillList(props) {
    const { apiRequest, userSkills, getUserSkills } = props;

    // create a new user service instance
    const service = new userService(apiRequest);
    const { setError } = useErrorHandler();

    // state declaration
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [skillId, setSkillId] = useState(null);

    // open update modal
    const handleUpdateModal = (target) => {
        if (target.id) {
            setSkillId(target.id);
        } else {
            setSkillId(target.parentElement.id);
        };
        setIsModalVisible(true);
    };

    // toggle update handleUpdateModal
    const toggleModal = () => {
        setIsModalVisible(!isModalVisible);
    };

    // delete a skill
    const handleDeleteSkill = (target) => {
        let id;
        if (target.id) {
            id = target.id;
        } else {
            id = target.parentElement.id;
        };
        service.deleteUserSkill(id)
            .then((res) => {
                if (res.data.status === "success") {
                    getUserSkills();
                    alertNotification('success', "Deleted your skill successfully");
                }
            })
            .catch((err) => {
                setError(err);
            })
    };

    const columns = [
        {
            title: '#Id',
            dataIndex: 'id',
            key: 'id',
            align: "center"
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            align: "center",
        },
        {
            title: 'Tagline',
            dataIndex: 'tag_line',
            key: 'tag_line',
            align: "center"
        },
        {
            title: 'Travel Fee',
            dataIndex: 'travel_fee',
            key: 'travel_fee',
            align: "center"
        },
        {
            title: 'Location Options',
            key: 'location_options',
            dataIndex: 'location_options',
            align: "center",
            render: location_options => (
                <React.Fragment>
                    {location_options.map(option => {
                        let color = option.length > 5 ? 'geekblue' : 'green';
                        if (option === 'choose') {
                            color = 'volcano';
                        }
                        return (
                            <Tag color={color} key={option}>
                                {option.toUpperCase()}
                            </Tag>
                        );
                    })}
                </React.Fragment>
            ),
        },
        {
            title: 'Edit',
            dataIndex: 'edit',
            key: 'edit',
            align: "center"
        },
    ];

    const data = userSkills.map((skill, index) => {
        return {
            key: skill.id,
            id: index + 1,
            category: skill.category,
            tag_line: skill.tag_line,
            travel_fee: skill.travel_fee,
            location_options: skill.location_options.map(el => el.option),
            edit:
                <React.Fragment>
                    <Space>
                        <Button type="primary" shape="round" size="small" id={skill.id} onClick={(e) => handleUpdateModal(e.target)}>
                            Update
                        </Button>
                        <Button type="danger" htmlType='submit' shape="round" size="small" id={skill.id} onClick={(e) => handleDeleteSkill(e.target)}>
                            Delete
                        </Button>
                    </Space>
                </React.Fragment>
        }
    });

    return (
        <React.Fragment>
            <Table
                pagination={false}
                bordered
                columns={columns}
                dataSource={data}
            />
            <Modal visible={isModalVisible} footer={null} destroyOnClose={true} onCancel={toggleModal}>
                <SkillUpdate
                    apiRequest={props.apiRequest}
                    skillId={skillId}
                    getUserSkills={getUserSkills}
                    toggleModal={toggleModal}
                />
            </Modal>
        </React.Fragment >
    )
};
