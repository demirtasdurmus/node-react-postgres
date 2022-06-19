export default class UserService {
    constructor(request) {
        this.request = request;
    };

    // get user's skills
    getUserSkills() {
        return this.request.get("/api/v1/skills");
    };

    // get user's skill by i
    getUserSkillById(id) {
        return this.request.get(`/api/v1/skills/${id}`);
    };

    // add user's skills
    addUserSkill(payload) {
        return this.request.post("/api/v1/skills", payload);
    };

    // delete user's skills
    deleteUserSkill(id) {
        return this.request.delete(`/api/v1/skills/${id}`);
    };

    // update user's skills
    updateUserSkill(payload) {
        return this.request.patch(`/api/v1/skills/${payload.id}`, payload);
    };

    // check user's auth status
    checkUserAuth() {
        return this.request.get("/api/v1/auth/check-auth");
    };

    // logout user
    logoutUser() {
        return this.request.get("/api/v1/auth/logout");
    };
};