export default function AlertError(message) {
    var errorOptions = {
        place: "tc",
        message: (
            <div className="notification-msg">
                <div>{message}</div>
            </div>
        ),
        type: "info",
        icon: "",
        autoDismiss: 7,
    };
    return errorOptions;
};