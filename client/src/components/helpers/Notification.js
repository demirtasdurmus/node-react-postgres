import { notification } from 'antd';

export default function openNotificationWithIcon(type, message) {
    notification.config({
        placement: 'topRight',
        // bottom: 50,
        duration: 5,
        rtl: true,
    });
    notification[type]({
        message: message,
    });
};