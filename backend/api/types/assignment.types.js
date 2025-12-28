"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileType = exports.SubmissionStatus = exports.AssignmentStatus = void 0;
var AssignmentStatus;
(function (AssignmentStatus) {
    AssignmentStatus["DRAFT"] = "draft";
    AssignmentStatus["PUBLISHED"] = "published";
    AssignmentStatus["CLOSED"] = "closed";
})(AssignmentStatus || (exports.AssignmentStatus = AssignmentStatus = {}));
var SubmissionStatus;
(function (SubmissionStatus) {
    SubmissionStatus["NOT_SUBMITTED"] = "not_submitted";
    SubmissionStatus["SUBMITTED"] = "submitted";
    SubmissionStatus["LATE"] = "late";
    SubmissionStatus["GRADED"] = "graded";
    SubmissionStatus["RETURNED"] = "returned";
})(SubmissionStatus || (exports.SubmissionStatus = SubmissionStatus = {}));
var FileType;
(function (FileType) {
    FileType["PDF"] = "pdf";
    FileType["DOC"] = "doc";
    FileType["DOCX"] = "docx";
    FileType["TXT"] = "txt";
    FileType["ZIP"] = "zip";
    FileType["IMAGE"] = "image";
    FileType["ANY"] = "any";
})(FileType || (exports.FileType = FileType = {}));
//# sourceMappingURL=assignment.types.js.map