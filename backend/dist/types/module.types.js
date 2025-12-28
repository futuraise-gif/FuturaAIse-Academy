"use strict";
/**
 * Module Types for Course Content
 * Modules contain lectures, materials, assignments
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleStatus = exports.ModuleType = void 0;
var ModuleType;
(function (ModuleType) {
    ModuleType["LECTURE"] = "lecture";
    ModuleType["LAB"] = "lab";
    ModuleType["ASSIGNMENT"] = "assignment";
    ModuleType["QUIZ"] = "quiz";
    ModuleType["LIVE_CLASS"] = "live_class";
    ModuleType["READING"] = "reading";
})(ModuleType || (exports.ModuleType = ModuleType = {}));
var ModuleStatus;
(function (ModuleStatus) {
    ModuleStatus["DRAFT"] = "draft";
    ModuleStatus["PUBLISHED"] = "published";
    ModuleStatus["SCHEDULED"] = "scheduled";
})(ModuleStatus || (exports.ModuleStatus = ModuleStatus = {}));
//# sourceMappingURL=module.types.js.map