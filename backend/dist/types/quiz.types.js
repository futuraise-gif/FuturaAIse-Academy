"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionType = exports.QuizStatus = void 0;
var QuizStatus;
(function (QuizStatus) {
    QuizStatus["DRAFT"] = "draft";
    QuizStatus["PUBLISHED"] = "published";
    QuizStatus["CLOSED"] = "closed";
})(QuizStatus || (exports.QuizStatus = QuizStatus = {}));
var QuestionType;
(function (QuestionType) {
    QuestionType["MULTIPLE_CHOICE"] = "multiple_choice";
    QuestionType["TRUE_FALSE"] = "true_false";
    QuestionType["SHORT_ANSWER"] = "short_answer";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
//# sourceMappingURL=quiz.types.js.map