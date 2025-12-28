"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LetterGrade = exports.GradingScheme = exports.GradeColumnType = void 0;
var GradeColumnType;
(function (GradeColumnType) {
    GradeColumnType["ASSIGNMENT"] = "assignment";
    GradeColumnType["EXAM"] = "exam";
    GradeColumnType["QUIZ"] = "quiz";
    GradeColumnType["PARTICIPATION"] = "participation";
    GradeColumnType["CUSTOM"] = "custom";
    GradeColumnType["TOTAL"] = "total";
})(GradeColumnType || (exports.GradeColumnType = GradeColumnType = {}));
var GradingScheme;
(function (GradingScheme) {
    GradingScheme["POINTS"] = "points";
    GradingScheme["PERCENTAGE"] = "percentage";
    GradingScheme["LETTER"] = "letter";
    GradingScheme["PASS_FAIL"] = "pass_fail";
})(GradingScheme || (exports.GradingScheme = GradingScheme = {}));
var LetterGrade;
(function (LetterGrade) {
    LetterGrade["A_PLUS"] = "A+";
    LetterGrade["A"] = "A";
    LetterGrade["A_MINUS"] = "A-";
    LetterGrade["B_PLUS"] = "B+";
    LetterGrade["B"] = "B";
    LetterGrade["B_MINUS"] = "B-";
    LetterGrade["C_PLUS"] = "C+";
    LetterGrade["C"] = "C";
    LetterGrade["C_MINUS"] = "C-";
    LetterGrade["D_PLUS"] = "D+";
    LetterGrade["D"] = "D";
    LetterGrade["D_MINUS"] = "D-";
    LetterGrade["F"] = "F";
})(LetterGrade || (exports.LetterGrade = LetterGrade = {}));
//# sourceMappingURL=grade.types.js.map