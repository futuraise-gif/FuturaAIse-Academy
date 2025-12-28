"use strict";
/**
 * Attendance Tracking System
 * Manual + Auto attendance for live classes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceMethod = exports.AttendanceStatus = void 0;
var AttendanceStatus;
(function (AttendanceStatus) {
    AttendanceStatus["PRESENT"] = "present";
    AttendanceStatus["ABSENT"] = "absent";
    AttendanceStatus["LATE"] = "late";
    AttendanceStatus["EXCUSED"] = "excused";
})(AttendanceStatus || (exports.AttendanceStatus = AttendanceStatus = {}));
var AttendanceMethod;
(function (AttendanceMethod) {
    AttendanceMethod["MANUAL"] = "manual";
    AttendanceMethod["AUTO"] = "auto";
    AttendanceMethod["SELF"] = "self";
})(AttendanceMethod || (exports.AttendanceMethod = AttendanceMethod = {}));
//# sourceMappingURL=attendance.types.js.map