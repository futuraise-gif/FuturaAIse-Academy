"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizModel = void 0;
const firebase_1 = require("../config/firebase");
const quiz_types_1 = require("../types/quiz.types");
const uuid_1 = require("uuid");
const COURSES_COLLECTION = 'courses';
const QUIZZES_SUBCOLLECTION = 'quizzes';
const QUIZ_ATTEMPTS_SUBCOLLECTION = 'quizAttempts';
class QuizModel {
    /**
     * Create a new quiz
     */
    static async create(userId, data) {
        const quizRef = firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(data.course_id)
            .collection(QUIZZES_SUBCOLLECTION)
            .doc();
        // Process questions with IDs and order
        const questions = data.questions.map((q, index) => ({
            id: (0, uuid_1.v4)(),
            ...q,
            order: index + 1,
        }));
        // Calculate total points
        const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
        const quiz = {
            course_id: data.course_id,
            title: data.title,
            description: data.description,
            instructions: data.instructions,
            time_limit_minutes: data.time_limit_minutes,
            max_attempts: data.max_attempts ?? 1,
            shuffle_questions: data.shuffle_questions ?? false,
            shuffle_options: data.shuffle_options ?? false,
            show_correct_answers: data.show_correct_answers ?? true,
            show_score_immediately: data.show_score_immediately ?? true,
            available_from: data.available_from,
            available_until: data.available_until,
            total_points: totalPoints,
            passing_score: data.passing_score,
            questions,
            status: quiz_types_1.QuizStatus.DRAFT,
            total_attempts: 0,
            created_by: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        await quizRef.set(quiz);
        return {
            id: quizRef.id,
            ...quiz,
        };
    }
    /**
     * Get quiz by ID
     */
    static async findById(courseId, quizId) {
        const doc = await firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(courseId)
            .collection(QUIZZES_SUBCOLLECTION)
            .doc(quizId)
            .get();
        if (!doc.exists) {
            return null;
        }
        return {
            id: doc.id,
            ...doc.data(),
        };
    }
    /**
     * Get all quizzes for a course
     */
    static async findByCourse(courseId, filters) {
        let query = firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(courseId)
            .collection(QUIZZES_SUBCOLLECTION);
        if (filters?.status) {
            query = query.where('status', '==', filters.status);
        }
        // Removed orderBy to avoid composite index requirement
        const snapshot = await query.get();
        let quizzes = [];
        snapshot.forEach((doc) => {
            quizzes.push({
                id: doc.id,
                ...doc.data(),
            });
        });
        // Sort by created_at (most recent first) in application layer
        quizzes.sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        return quizzes;
    }
    /**
     * Update quiz
     */
    static async update(courseId, quizId, updates) {
        const quizRef = firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(courseId)
            .collection(QUIZZES_SUBCOLLECTION)
            .doc(quizId);
        const doc = await quizRef.get();
        if (!doc.exists) {
            return null;
        }
        const updateData = {
            ...updates,
            updated_at: new Date().toISOString(),
        };
        // Process questions if provided
        if (updates.questions) {
            const questions = updates.questions.map((q, index) => ({
                id: (0, uuid_1.v4)(),
                ...q,
                order: index + 1,
            }));
            updateData.questions = questions;
            updateData.total_points = questions.reduce((sum, q) => sum + q.points, 0);
        }
        await quizRef.update(updateData);
        return this.findById(courseId, quizId);
    }
    /**
     * Publish quiz
     */
    static async publish(courseId, quizId) {
        return this.update(courseId, quizId, { status: quiz_types_1.QuizStatus.PUBLISHED });
    }
    /**
     * Close quiz
     */
    static async close(courseId, quizId) {
        return this.update(courseId, quizId, { status: quiz_types_1.QuizStatus.CLOSED });
    }
    /**
     * Delete quiz
     */
    static async delete(courseId, quizId) {
        try {
            await firebase_1.db
                .collection(COURSES_COLLECTION)
                .doc(courseId)
                .collection(QUIZZES_SUBCOLLECTION)
                .doc(quizId)
                .delete();
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Start a quiz attempt
     */
    static async startAttempt(courseId, quizId, userId, userName, userEmail) {
        const quiz = await this.findById(courseId, quizId);
        if (!quiz) {
            throw new Error('Quiz not found');
        }
        // Check if quiz is available
        const now = new Date();
        const availableFrom = new Date(quiz.available_from);
        const availableUntil = new Date(quiz.available_until);
        if (now < availableFrom) {
            throw new Error('Quiz is not yet available');
        }
        if (now > availableUntil) {
            throw new Error('Quiz is no longer available');
        }
        // Check previous attempts
        const previousAttempts = await this.getStudentAttempts(courseId, quizId, userId);
        const attemptNumber = previousAttempts.length + 1;
        if (attemptNumber > quiz.max_attempts) {
            throw new Error(`Maximum ${quiz.max_attempts} attempts allowed`);
        }
        const attemptRef = firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(courseId)
            .collection(QUIZZES_SUBCOLLECTION)
            .doc(quizId)
            .collection(QUIZ_ATTEMPTS_SUBCOLLECTION)
            .doc();
        const attempt = {
            quiz_id: quizId,
            course_id: courseId,
            student_id: userId,
            student_name: userName,
            student_email: userEmail,
            attempt_number: attemptNumber,
            started_at: new Date().toISOString(),
            answers: {},
            score: 0,
            max_score: quiz.total_points,
            percentage: 0,
            is_submitted: false,
            auto_graded: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        await attemptRef.set(attempt);
        return {
            id: attemptRef.id,
            ...attempt,
        };
    }
    /**
     * Submit quiz attempt with auto-grading
     */
    static async submitAttempt(courseId, quizId, attemptId, data) {
        const quiz = await this.findById(courseId, quizId);
        if (!quiz) {
            throw new Error('Quiz not found');
        }
        const attemptRef = firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(courseId)
            .collection(QUIZZES_SUBCOLLECTION)
            .doc(quizId)
            .collection(QUIZ_ATTEMPTS_SUBCOLLECTION)
            .doc(attemptId);
        const attemptDoc = await attemptRef.get();
        if (!attemptDoc.exists) {
            throw new Error('Attempt not found');
        }
        const attempt = attemptDoc.data();
        if (attempt.is_submitted) {
            throw new Error('Quiz already submitted');
        }
        // Auto-grade answers
        const gradedAnswers = {};
        let totalScore = 0;
        for (const question of quiz.questions) {
            const studentAnswer = data.answers[question.id];
            const gradeResult = this.gradeAnswer(question, studentAnswer);
            gradedAnswers[question.id] = {
                question_id: question.id,
                question_type: question.type,
                student_answer: studentAnswer,
                is_correct: gradeResult.isCorrect,
                points_earned: gradeResult.pointsEarned,
                max_points: question.points,
            };
            totalScore += gradeResult.pointsEarned;
        }
        // Calculate time taken
        const submittedAt = new Date();
        const startedAt = new Date(attempt.started_at);
        const timeTakenMinutes = Math.round((submittedAt.getTime() - startedAt.getTime()) / (1000 * 60));
        const percentage = (totalScore / quiz.total_points) * 100;
        const passed = quiz.passing_score ? percentage >= quiz.passing_score : undefined;
        const updates = {
            answers: gradedAnswers,
            score: totalScore,
            percentage,
            passed,
            submitted_at: submittedAt.toISOString(),
            time_taken_minutes: timeTakenMinutes,
            is_submitted: true,
            auto_graded: true,
            updated_at: new Date().toISOString(),
        };
        await attemptRef.update(updates);
        // Update quiz statistics
        await this.updateQuizStats(courseId, quizId);
        const updatedDoc = await attemptRef.get();
        return {
            id: updatedDoc.id,
            ...updatedDoc.data(),
        };
    }
    /**
     * Grade a single answer
     */
    static gradeAnswer(question, studentAnswer) {
        let isCorrect = false;
        switch (question.type) {
            case quiz_types_1.QuestionType.MULTIPLE_CHOICE:
                isCorrect = studentAnswer === question.correct_option_index;
                break;
            case quiz_types_1.QuestionType.TRUE_FALSE:
                isCorrect = studentAnswer === question.correct_answer;
                break;
            case quiz_types_1.QuestionType.SHORT_ANSWER:
                if (question.correct_answers && typeof studentAnswer === 'string') {
                    const normalizedAnswer = question.case_sensitive
                        ? studentAnswer.trim()
                        : studentAnswer.trim().toLowerCase();
                    isCorrect = question.correct_answers.some((correctAns) => {
                        const normalizedCorrect = question.case_sensitive
                            ? correctAns.trim()
                            : correctAns.trim().toLowerCase();
                        return normalizedAnswer === normalizedCorrect;
                    });
                }
                break;
        }
        return {
            isCorrect,
            pointsEarned: isCorrect ? question.points : 0,
        };
    }
    /**
     * Get student's attempts for a quiz
     */
    static async getStudentAttempts(courseId, quizId, userId) {
        // Removed orderBy to avoid composite index requirement
        const snapshot = await firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(courseId)
            .collection(QUIZZES_SUBCOLLECTION)
            .doc(quizId)
            .collection(QUIZ_ATTEMPTS_SUBCOLLECTION)
            .where('student_id', '==', userId)
            .get();
        let attempts = [];
        snapshot.forEach((doc) => {
            attempts.push({
                id: doc.id,
                ...doc.data(),
            });
        });
        // Sort by attempt_number (highest first) in application layer
        attempts.sort((a, b) => {
            return b.attempt_number - a.attempt_number;
        });
        return attempts;
    }
    /**
     * Get all attempts for a quiz
     */
    static async getAllAttempts(courseId, quizId) {
        // Removed orderBy to avoid composite index requirement
        const snapshot = await firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(courseId)
            .collection(QUIZZES_SUBCOLLECTION)
            .doc(quizId)
            .collection(QUIZ_ATTEMPTS_SUBCOLLECTION)
            .where('is_submitted', '==', true)
            .get();
        let attempts = [];
        snapshot.forEach((doc) => {
            attempts.push({
                id: doc.id,
                ...doc.data(),
            });
        });
        // Sort by submitted_at (most recent first) in application layer
        attempts.sort((a, b) => {
            return new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime();
        });
        return attempts;
    }
    /**
     * Get quiz statistics
     */
    static async getStatistics(courseId, quizId) {
        const quiz = await this.findById(courseId, quizId);
        if (!quiz) {
            return null;
        }
        const attempts = await this.getAllAttempts(courseId, quizId);
        if (attempts.length === 0) {
            return null;
        }
        // Get best attempt per student
        const studentBestAttempts = new Map();
        for (const attempt of attempts) {
            const existing = studentBestAttempts.get(attempt.student_id);
            if (!existing || attempt.score > existing.score) {
                studentBestAttempts.set(attempt.student_id, attempt);
            }
        }
        const bestAttempts = Array.from(studentBestAttempts.values());
        const scores = bestAttempts.map((a) => a.score);
        // Calculate statistics
        const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        const sortedScores = [...scores].sort((a, b) => a - b);
        const medianScore = sortedScores[Math.floor(sortedScores.length / 2)];
        const minScore = Math.min(...scores);
        const maxScore = Math.max(...scores);
        const variance = scores.reduce((sum, s) => sum + Math.pow(s - averageScore, 2), 0) / scores.length;
        const stdDeviation = Math.sqrt(variance);
        // Pass rate
        let studentsPassed = 0;
        if (quiz.passing_score) {
            studentsPassed = bestAttempts.filter((a) => a.passed === true).length;
        }
        const passRate = quiz.passing_score ? (studentsPassed / bestAttempts.length) * 100 : 0;
        // Question statistics
        const questionStats = {};
        for (const question of quiz.questions) {
            let totalAttempts = 0;
            let correctAnswers = 0;
            for (const attempt of attempts) {
                const answer = attempt.answers[question.id];
                if (answer) {
                    totalAttempts++;
                    if (answer.is_correct) {
                        correctAnswers++;
                    }
                }
            }
            questionStats[question.id] = {
                question_text: question.question_text,
                total_attempts: totalAttempts,
                correct_answers: correctAnswers,
                accuracy_rate: totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0,
            };
        }
        return {
            quiz_id: quizId,
            quiz_title: quiz.title,
            total_attempts: attempts.length,
            unique_students: studentBestAttempts.size,
            average_score: averageScore,
            median_score: medianScore,
            min_score: minScore,
            max_score: maxScore,
            std_deviation: stdDeviation,
            passing_score: quiz.passing_score,
            students_passed: studentsPassed,
            pass_rate: passRate,
            question_statistics: questionStats,
        };
    }
    /**
     * Update quiz statistics
     */
    static async updateQuizStats(courseId, quizId) {
        const attempts = await this.getAllAttempts(courseId, quizId);
        if (attempts.length === 0) {
            return;
        }
        const scores = attempts.map((a) => a.score);
        const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        await firebase_1.db
            .collection(COURSES_COLLECTION)
            .doc(courseId)
            .collection(QUIZZES_SUBCOLLECTION)
            .doc(quizId)
            .update({
            total_attempts: attempts.length,
            average_score: averageScore,
            updated_at: new Date().toISOString(),
        });
    }
}
exports.QuizModel = QuizModel;
//# sourceMappingURL=quiz.model.js.map