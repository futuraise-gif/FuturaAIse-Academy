"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPriority = exports.NotificationType = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType["ANNOUNCEMENT"] = "announcement";
    NotificationType["ASSIGNMENT"] = "assignment";
    NotificationType["GRADE"] = "grade";
    NotificationType["DISCUSSION"] = "discussion";
    NotificationType["COURSE"] = "course";
    NotificationType["SYSTEM"] = "system";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority["LOW"] = "low";
    NotificationPriority["NORMAL"] = "normal";
    NotificationPriority["HIGH"] = "high";
    NotificationPriority["URGENT"] = "urgent";
})(NotificationPriority || (exports.NotificationPriority = NotificationPriority = {}));
//# sourceMappingURL=notification.types.js.map