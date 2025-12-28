"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactionType = exports.ThreadStatus = exports.ThreadCategory = void 0;
var ThreadCategory;
(function (ThreadCategory) {
    ThreadCategory["GENERAL"] = "general";
    ThreadCategory["QUESTIONS"] = "questions";
    ThreadCategory["ANNOUNCEMENTS"] = "announcements";
    ThreadCategory["STUDY_GROUP"] = "study_group";
    ThreadCategory["TECHNICAL_HELP"] = "technical_help";
    ThreadCategory["CUSTOM"] = "custom";
})(ThreadCategory || (exports.ThreadCategory = ThreadCategory = {}));
var ThreadStatus;
(function (ThreadStatus) {
    ThreadStatus["OPEN"] = "open";
    ThreadStatus["LOCKED"] = "locked";
    ThreadStatus["ARCHIVED"] = "archived";
})(ThreadStatus || (exports.ThreadStatus = ThreadStatus = {}));
var ReactionType;
(function (ReactionType) {
    ReactionType["LIKE"] = "like";
    ReactionType["HELPFUL"] = "helpful";
    ReactionType["THANKS"] = "thanks";
    ReactionType["INSIGHTFUL"] = "insightful";
})(ReactionType || (exports.ReactionType = ReactionType = {}));
//# sourceMappingURL=discussion.types.js.map