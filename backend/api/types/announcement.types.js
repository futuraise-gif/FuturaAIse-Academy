"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementStatus = exports.AnnouncementPriority = exports.AnnouncementType = void 0;
var AnnouncementType;
(function (AnnouncementType) {
    AnnouncementType["COURSE"] = "course";
    AnnouncementType["GLOBAL"] = "global";
})(AnnouncementType || (exports.AnnouncementType = AnnouncementType = {}));
var AnnouncementPriority;
(function (AnnouncementPriority) {
    AnnouncementPriority["LOW"] = "low";
    AnnouncementPriority["NORMAL"] = "normal";
    AnnouncementPriority["HIGH"] = "high";
    AnnouncementPriority["URGENT"] = "urgent";
})(AnnouncementPriority || (exports.AnnouncementPriority = AnnouncementPriority = {}));
var AnnouncementStatus;
(function (AnnouncementStatus) {
    AnnouncementStatus["DRAFT"] = "draft";
    AnnouncementStatus["PUBLISHED"] = "published";
    AnnouncementStatus["ARCHIVED"] = "archived";
})(AnnouncementStatus || (exports.AnnouncementStatus = AnnouncementStatus = {}));
//# sourceMappingURL=announcement.types.js.map