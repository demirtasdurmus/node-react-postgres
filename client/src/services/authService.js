export default class AuthService {
    constructor(request) {
        this.request = request;
    };

    // register user
    registerUser(values) {
        return this.request.post("/api/v1/auth/register", values);
    };

    // login user
    loginUser(values) {
        return this.request.post("/api/v1/auth/login", values);
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