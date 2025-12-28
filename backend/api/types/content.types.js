"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentStatus = exports.FileType = exports.ContentType = void 0;
var ContentType;
(function (ContentType) {
    ContentType["FOLDER"] = "folder";
    ContentType["FILE"] = "file";
    ContentType["LINK"] = "link";
    ContentType["TEXT"] = "text";
    ContentType["ASSIGNMENT_LINK"] = "assignment_link";
    ContentType["QUIZ_LINK"] = "quiz_link";
})(ContentType || (exports.ContentType = ContentType = {}));
var FileType;
(function (FileType) {
    FileType["PDF"] = "pdf";
    FileType["VIDEO"] = "video";
    FileType["AUDIO"] = "audio";
    FileType["IMAGE"] = "image";
    FileType["DOCUMENT"] = "document";
    FileType["PRESENTATION"] = "presentation";
    FileType["SPREADSHEET"] = "spreadsheet";
    FileType["ARCHIVE"] = "archive";
    FileType["CODE"] = "code";
    FileType["OTHER"] = "other";
})(FileType || (exports.FileType = FileType = {}));
var ContentStatus;
(function (ContentStatus) {
    ContentStatus["DRAFT"] = "draft";
    ContentStatus["PUBLISHED"] = "published";
    ContentStatus["SCHEDULED"] = "scheduled";
    ContentStatus["HIDDEN"] = "hidden";
})(ContentStatus || (exports.ContentStatus = ContentStatus = {}));
//# sourceMappingURL=content.types.js.map