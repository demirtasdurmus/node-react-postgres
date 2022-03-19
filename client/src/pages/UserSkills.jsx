import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SkillAdd from "../components/skills/SkillAdd";
import SkillList from "../components/skills/SkillList";
import Notification from "../components/helpers/Notification";
import useAuth from '../hooks/useAuth';


export default function UserSkills() {
    const { logoutUser } = useAuth();
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
            <button onClick={logoutUser}>Logout</button>
            <SkillAdd
                getUserSkills={getUserSkills}
            />
            <SkillList
                userSkills={userSkills}
                getUserSkills={getUserSkills}
            />
        </React.Fragment>
    )
};
