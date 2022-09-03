import axios from "axios";

export default function createChannel() {
    const controller = new AbortController();
    const token = localStorage.getItem("r-token");
    const request = axios.create({
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        signal: controller.signal,
    });
    return { request, controller }
};