"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Term = exports.EnrollmentRole = exports.EnrollmentStatus = exports.CourseStatus = void 0;
var CourseStatus;
(function (CourseStatus) {
    CourseStatus["DRAFT"] = "draft";
    CourseStatus["PUBLISHED"] = "published";
    CourseStatus["ARCHIVED"] = "archived";
})(CourseStatus || (exports.CourseStatus = CourseStatus = {}));
var EnrollmentStatus;
(function (EnrollmentStatus) {
    EnrollmentStatus["ACTIVE"] = "active";
    EnrollmentStatus["DROPPED"] = "dropped";
    EnrollmentStatus["COMPLETED"] = "completed";
    EnrollmentStatus["SUSPENDED"] = "suspended";
})(EnrollmentStatus || (exports.EnrollmentStatus = EnrollmentStatus = {}));
var EnrollmentRole;
(function (EnrollmentRole) {
    EnrollmentRole["STUDENT"] = "student";
    EnrollmentRole["TEACHING_ASSISTANT"] = "teaching_assistant";
    EnrollmentRole["INSTRUCTOR"] = "instructor";
})(EnrollmentRole || (exports.EnrollmentRole = EnrollmentRole = {}));
var Term;
(function (Term) {
    Term["FALL"] = "fall";
    Term["SPRING"] = "spring";
    Term["SUMMER"] = "summer";
    Term["WINTER"] = "winter";
})(Term || (exports.Term = Term = {}));
//# sourceMappingURL=course.types.js.map