import { db } from '../config/firebase';
import {
  Quiz,
  QuizQuestion,
  QuizAttempt,
  QuizStatus,
  QuestionType,
  QuizStatistics,
  CreateQuizDTO,
  UpdateQuizDTO,
  SubmitQuizAttemptDTO,
} from '../types/quiz.types';
import { v4 as uuidv4 } from 'uuid';

const COURSES_COLLECTION = 'courses';
const QUIZZES_SUBCOLLECTION = 'quizzes';
const QUIZ_ATTEMPTS_SUBCOLLECTION = 'quizAttempts';

export class QuizModel {
  /**
   * Create a new quiz
   */
  static async create(userId: string, data: CreateQuizDTO): Promise<Quiz> {
    const quizRef = db
      .collection(COURSES_COLLECTION)
      .doc(data.course_id)
      .collection(QUIZZES_SUBCOLLECTION)
      .doc();

    // Process questions with IDs and order
    const questions: QuizQuestion[] = data.questions.map((q, index) => ({
      id: uuidv4(),
      ...q,
      order: index + 1,
    }));

    // Calculate total points
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    const quiz: Omit<Quiz, 'id'> = {
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
      status: QuizStatus.DRAFT,
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
  static async findById(courseId: string, quizId: string): Promise<Quiz | null> {
    const doc = await db
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
    } as Quiz;
  }

  /**
   * Get all quizzes for a course
   */
  static async findByCourse(
    courseId: string,
    filters?: { status?: QuizStatus }
  ): Promise<Quiz[]> {
    let query: any = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(QUIZZES_SUBCOLLECTION);

    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }

    // Removed orderBy to avoid composite index requirement
    const snapshot = await query.get();
    let quizzes: Quiz[] = [];

    snapshot.forEach((doc: any) => {
      quizzes.push({
        id: doc.id,
        ...doc.data(),
      } as Quiz);
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
  static async update(
    courseId: string,
    quizId: string,
    updates: UpdateQuizDTO
  ): Promise<Quiz | null> {
    const quizRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(QUIZZES_SUBCOLLECTION)
      .doc(quizId);

    const doc = await quizRef.get();

    if (!doc.exists) {
      return null;
    }

    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Process questions if provided
    if (updates.questions) {
      const questions: QuizQuestion[] = updates.questions.map((q, index) => ({
        id: uuidv4(),
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
  static async publish(courseId: string, quizId: string): Promise<Quiz | null> {
    return this.update(courseId, quizId, { status: QuizStatus.PUBLISHED });
  }

  /**
   * Close quiz
   */
  static async close(courseId: string, quizId: string): Promise<Quiz | null> {
    return this.update(courseId, quizId, { status: QuizStatus.CLOSED });
  }

  /**
   * Delete quiz
   */
  static async delete(courseId: string, quizId: string): Promise<boolean> {
    try {
      await db
        .collection(COURSES_COLLECTION)
        .doc(courseId)
        .collection(QUIZZES_SUBCOLLECTION)
        .doc(quizId)
        .delete();

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Start a quiz attempt
   */
  static async startAttempt(
    courseId: string,
    quizId: string,
    userId: string,
    userName: string,
    userEmail: string
  ): Promise<QuizAttempt> {
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

    const attemptRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(QUIZZES_SUBCOLLECTION)
      .doc(quizId)
      .collection(QUIZ_ATTEMPTS_SUBCOLLECTION)
      .doc();

    const attempt: Omit<QuizAttempt, 'id'> = {
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
  static async submitAttempt(
    courseId: string,
    quizId: string,
    attemptId: string,
    data: SubmitQuizAttemptDTO
  ): Promise<QuizAttempt> {
    const quiz = await this.findById(courseId, quizId);

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const attemptRef = db
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

    const attempt = attemptDoc.data() as QuizAttempt;

    if (attempt.is_submitted) {
      throw new Error('Quiz already submitted');
    }

    // Auto-grade answers
    const gradedAnswers: QuizAttempt['answers'] = {};
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
    const timeTakenMinutes = Math.round(
      (submittedAt.getTime() - startedAt.getTime()) / (1000 * 60)
    );

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
    } as QuizAttempt;
  }

  /**
   * Grade a single answer
   */
  private static gradeAnswer(
    question: QuizQuestion,
    studentAnswer: string | number | boolean
  ): { isCorrect: boolean; pointsEarned: number } {
    let isCorrect = false;

    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        isCorrect = studentAnswer === question.correct_option_index;
        break;

      case QuestionType.TRUE_FALSE:
        isCorrect = studentAnswer === question.correct_answer;
        break;

      case QuestionType.SHORT_ANSWER:
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
  static async getStudentAttempts(
    courseId: string,
    quizId: string,
    userId: string
  ): Promise<QuizAttempt[]> {
    // Removed orderBy to avoid composite index requirement
    const snapshot = await db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(QUIZZES_SUBCOLLECTION)
      .doc(quizId)
      .collection(QUIZ_ATTEMPTS_SUBCOLLECTION)
      .where('student_id', '==', userId)
      .get();

    let attempts: QuizAttempt[] = [];

    snapshot.forEach((doc: any) => {
      attempts.push({
        id: doc.id,
        ...doc.data(),
      } as QuizAttempt);
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
  static async getAllAttempts(courseId: string, quizId: string): Promise<QuizAttempt[]> {
    // Removed orderBy to avoid composite index requirement
    const snapshot = await db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(QUIZZES_SUBCOLLECTION)
      .doc(quizId)
      .collection(QUIZ_ATTEMPTS_SUBCOLLECTION)
      .where('is_submitted', '==', true)
      .get();

    let attempts: QuizAttempt[] = [];

    snapshot.forEach((doc: any) => {
      attempts.push({
        id: doc.id,
        ...doc.data(),
      } as QuizAttempt);
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
  static async getStatistics(courseId: string, quizId: string): Promise<QuizStatistics | null> {
    const quiz = await this.findById(courseId, quizId);

    if (!quiz) {
      return null;
    }

    const attempts = await this.getAllAttempts(courseId, quizId);

    if (attempts.length === 0) {
      return null;
    }

    // Get best attempt per student
    const studentBestAttempts = new Map<string, QuizAttempt>();
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
    const questionStats: QuizStatistics['question_statistics'] = {};

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
  private static async updateQuizStats(courseId: string, quizId: string): Promise<void> {
    const attempts = await this.getAllAttempts(courseId, quizId);

    if (attempts.length === 0) {
      return;
    }

    const scores = attempts.map((a) => a.score);
    const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

    await db
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
