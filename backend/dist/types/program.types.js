"use strict";
/**
 * Program Types for AI Training Institution
 * Programs contain multiple courses (e.g., "Generative AI Bootcamp")
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramLevel = exports.ProgramStatus = void 0;
var ProgramStatus;
(function (ProgramStatus) {
    ProgramStatus["DRAFT"] = "draft";
    ProgramStatus["PUBLISHED"] = "published";
    ProgramStatus["ARCHIVED"] = "archived";
})(ProgramStatus || (exports.ProgramStatus = ProgramStatus = {}));
var ProgramLevel;
(function (ProgramLevel) {
    ProgramLevel["BEGINNER"] = "beginner";
    ProgramLevel["INTERMEDIATE"] = "intermediate";
    ProgramLevel["ADVANCED"] = "advanced";
    ProgramLevel["EXPERT"] = "expert";
})(ProgramLevel || (exports.ProgramLevel = ProgramLevel = {}));
//# sourceMappingURL=program.types.js.map