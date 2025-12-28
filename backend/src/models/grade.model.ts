import { db } from '../config/firebase';
import {
  GradeColumn,
  GradeEntry,
  StudentGradeRecord,
  GradeHistory,
  GradeStatistics,
  GradeColumnType,
  LetterGrade,
  CreateGradeColumnDTO,
  UpdateGradeColumnDTO,
  UpdateGradeDTO
} from '../types/grade.types';

const COURSES_COLLECTION = 'courses';
const GRADE_COLUMNS_SUBCOLLECTION = 'gradeColumns';
const GRADES_SUBCOLLECTION = 'grades';
const GRADE_HISTORY_SUBCOLLECTION = 'gradeHistory';

export class GradeModel {
  /**
   * Create a grade column
   */
  static async createColumn(userId: string, data: CreateGradeColumnDTO): Promise<GradeColumn> {
    const columnRef = db
      .collection(COURSES_COLLECTION)
      .doc(data.course_id)
      .collection(GRADE_COLUMNS_SUBCOLLECTION)
      .doc();

    // Get current max order
    const existingColumns = await this.getColumns(data.course_id);
    const maxOrder = existingColumns.length > 0 ? Math.max(...existingColumns.map(c => c.order)) : 0;

    const column: Omit<GradeColumn, 'id'> = {
      course_id: data.course_id,
      name: data.name,
      type: data.type,
      points: data.points,
      weight: data.weight,
      category: data.category,
      linked_assignment_id: data.linked_assignment_id,
      visible_to_students: data.visible_to_students ?? true,
      include_in_calculations: data.include_in_calculations ?? true,
      order: maxOrder + 1,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await columnRef.set(column);

    return {
      id: columnRef.id,
      ...column,
    };
  }

  /**
   * Get all grade columns for a course
   */
  static async getColumns(courseId: string): Promise<GradeColumn[]> {
    const snapshot = await db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(GRADE_COLUMNS_SUBCOLLECTION)
      .orderBy('order', 'asc')
      .get();

    const columns: GradeColumn[] = [];

    snapshot.forEach((doc: any) => {
      columns.push({
        id: doc.id,
        ...doc.data(),
      } as GradeColumn);
    });

    return columns;
  }

  /**
   * Update grade column
   */
  static async updateColumn(
    courseId: string,
    columnId: string,
    updates: UpdateGradeColumnDTO
  ): Promise<GradeColumn | null> {
    const columnRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(GRADE_COLUMNS_SUBCOLLECTION)
      .doc(columnId);

    const doc = await columnRef.get();

    if (!doc.exists) {
      return null;
    }

    await columnRef.update({
      ...updates,
      updated_at: new Date().toISOString(),
    });

    const updatedDoc = await columnRef.get();
    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    } as GradeColumn;
  }

  /**
   * Delete grade column
   */
  static async deleteColumn(courseId: string, columnId: string): Promise<boolean> {
    try {
      await db
        .collection(COURSES_COLLECTION)
        .doc(courseId)
        .collection(GRADE_COLUMNS_SUBCOLLECTION)
        .doc(columnId)
        .delete();

      // Also delete all grades for this column
      // This would be handled in a production system with Cloud Functions
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update a student's grade for a specific column
   */
  static async updateGrade(
    courseId: string,
    studentId: string,
    columnId: string,
    graderId: string,
    graderName: string,
    data: UpdateGradeDTO
  ): Promise<GradeEntry> {
    const gradeRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(GRADES_SUBCOLLECTION)
      .doc(studentId);

    // Get column info
    const columnDoc = await db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(GRADE_COLUMNS_SUBCOLLECTION)
      .doc(columnId)
      .get();

    if (!columnDoc.exists) {
      throw new Error('Grade column not found');
    }

    const column = { id: columnDoc.id, ...columnDoc.data() } as GradeColumn;

    // Get existing grade record
    const gradeDoc = await gradeRef.get();
    const existingRecord = gradeDoc.exists ? gradeDoc.data() as StudentGradeRecord : null;
    const existingGrade = existingRecord?.grades?.[columnId];

    // Create new grade entry
    const percentage = (data.grade / column.points) * 100;
    const newGradeEntry: GradeEntry = {
      column_id: columnId,
      column_name: column.name,
      column_type: column.type,
      grade: data.grade,
      max_points: column.points,
      percentage,
      letter_grade: this.calculateLetterGrade(percentage),
      is_override: data.is_override ?? false,
      override_reason: data.override_reason,
      graded_by: graderId,
      graded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Record grade history if grade changed
    if (existingGrade && existingGrade.grade !== data.grade) {
      await this.recordGradeHistory(
        courseId,
        studentId,
        columnId,
        column.name,
        existingGrade.grade,
        data.grade,
        graderId,
        graderName,
        data.override_reason,
        data.is_override ?? false
      );
    }

    // Update grade record
    const updatedGrades = {
      ...existingRecord?.grades,
      [columnId]: newGradeEntry,
    };

    await gradeRef.set(
      {
        course_id: courseId,
        student_id: studentId,
        grades: updatedGrades,
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );

    // Recalculate overall grade
    await this.recalculateOverallGrade(courseId, studentId);

    return newGradeEntry;
  }

  /**
   * Get all grades for a student in a course
   */
  static async getStudentGrades(courseId: string, studentId: string): Promise<StudentGradeRecord | null> {
    const doc = await db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(GRADES_SUBCOLLECTION)
      .doc(studentId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as StudentGradeRecord;
  }

  /**
   * Get all students' grades for a course (for instructor grade center)
   */
  static async getAllStudentGrades(courseId: string): Promise<StudentGradeRecord[]> {
    const snapshot = await db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(GRADES_SUBCOLLECTION)
      .get();

    const records: StudentGradeRecord[] = [];

    snapshot.forEach((doc: any) => {
      records.push({
        id: doc.id,
        ...doc.data(),
      } as StudentGradeRecord);
    });

    return records;
  }

  /**
   * Recalculate overall grade for a student
   */
  private static async recalculateOverallGrade(courseId: string, studentId: string): Promise<void> {
    const gradeRecord = await this.getStudentGrades(courseId, studentId);
    const columns = await this.getColumns(courseId);

    if (!gradeRecord) {
      return;
    }

    let totalPointsEarned = 0;
    let totalPointsPossible = 0;

    // Calculate based on columns that should be included
    for (const column of columns) {
      if (!column.include_in_calculations) continue;

      const gradeEntry = gradeRecord.grades[column.id];
      if (gradeEntry && gradeEntry.grade !== undefined) {
        totalPointsEarned += gradeEntry.grade;
        totalPointsPossible += column.points;
      }
    }

    const overallPercentage = totalPointsPossible > 0 ? (totalPointsEarned / totalPointsPossible) * 100 : 0;

    await db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(GRADES_SUBCOLLECTION)
      .doc(studentId)
      .update({
        overall_points_earned: totalPointsEarned,
        overall_points_possible: totalPointsPossible,
        overall_percentage: overallPercentage,
        overall_letter_grade: this.calculateLetterGrade(overallPercentage),
        calculated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
  }

  /**
   * Record grade change in history
   */
  private static async recordGradeHistory(
    courseId: string,
    studentId: string,
    columnId: string,
    columnName: string,
    oldGrade: number | undefined,
    newGrade: number,
    changedBy: string,
    changedByName: string,
    reason: string | undefined,
    isOverride: boolean
  ): Promise<void> {
    const historyRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(GRADES_SUBCOLLECTION)
      .doc(studentId)
      .collection(GRADE_HISTORY_SUBCOLLECTION)
      .doc();

    const history: Omit<GradeHistory, 'id'> = {
      course_id: courseId,
      student_id: studentId,
      column_id: columnId,
      column_name: columnName,
      old_grade: oldGrade,
      new_grade: newGrade,
      changed_by: changedBy,
      changed_by_name: changedByName,
      reason,
      is_override: isOverride,
      changed_at: new Date().toISOString(),
    };

    await historyRef.set(history);
  }

  /**
   * Get grade history for a student
   */
  static async getGradeHistory(courseId: string, studentId: string): Promise<GradeHistory[]> {
    const snapshot = await db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(GRADES_SUBCOLLECTION)
      .doc(studentId)
      .collection(GRADE_HISTORY_SUBCOLLECTION)
      .orderBy('changed_at', 'desc')
      .get();

    const history: GradeHistory[] = [];

    snapshot.forEach((doc: any) => {
      history.push({
        id: doc.id,
        ...doc.data(),
      } as GradeHistory);
    });

    return history;
  }

  /**
   * Calculate statistics for a grade column
   */
  static async calculateColumnStatistics(courseId: string, columnId: string): Promise<GradeStatistics | null> {
    const allGrades = await this.getAllStudentGrades(courseId);
    const column = await db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(GRADE_COLUMNS_SUBCOLLECTION)
      .doc(columnId)
      .get();

    if (!column.exists) {
      return null;
    }

    const columnData = column.data() as GradeColumn;
    const grades = allGrades
      .map(record => record.grades[columnId]?.grade)
      .filter((g): g is number => g !== undefined);

    if (grades.length === 0) {
      return null;
    }

    // Calculate statistics
    const mean = grades.reduce((sum, g) => sum + g, 0) / grades.length;
    const sortedGrades = [...grades].sort((a, b) => a - b);
    const median = sortedGrades[Math.floor(sortedGrades.length / 2)];
    const min = Math.min(...grades);
    const max = Math.max(...grades);

    // Standard deviation
    const variance = grades.reduce((sum, g) => sum + Math.pow(g - mean, 2), 0) / grades.length;
    const stdDeviation = Math.sqrt(variance);

    return {
      column_id: columnId,
      column_name: columnData.name,
      mean,
      median,
      min,
      max,
      std_deviation: stdDeviation,
      total_graded: grades.length,
      total_students: allGrades.length,
      grade_distribution: {},
    };
  }

  /**
   * Calculate letter grade from percentage
   */
  private static calculateLetterGrade(percentage: number): LetterGrade {
    if (percentage >= 97) return LetterGrade.A_PLUS;
    if (percentage >= 93) return LetterGrade.A;
    if (percentage >= 90) return LetterGrade.A_MINUS;
    if (percentage >= 87) return LetterGrade.B_PLUS;
    if (percentage >= 83) return LetterGrade.B;
    if (percentage >= 80) return LetterGrade.B_MINUS;
    if (percentage >= 77) return LetterGrade.C_PLUS;
    if (percentage >= 73) return LetterGrade.C;
    if (percentage >= 70) return LetterGrade.C_MINUS;
    if (percentage >= 67) return LetterGrade.D_PLUS;
    if (percentage >= 63) return LetterGrade.D;
    if (percentage >= 60) return LetterGrade.D_MINUS;
    return LetterGrade.F;
  }

  /**
   * Export grades to CSV format
   */
  static async exportGradesToCSV(courseId: string): Promise<string> {
    const columns = await this.getColumns(courseId);
    const allGrades = await this.getAllStudentGrades(courseId);

    // Build CSV header
    const headers = ['Student Name', 'Student Email', ...columns.map(c => c.name), 'Overall %', 'Overall Grade'];
    let csv = headers.join(',') + '\n';

    // Build rows
    for (const gradeRecord of allGrades) {
      const row = [
        `"${gradeRecord.student_name}"`,
        gradeRecord.student_email,
        ...columns.map(c => {
          const grade = gradeRecord.grades[c.id];
          return grade?.grade !== undefined ? grade.grade.toString() : '';
        }),
        gradeRecord.overall_percentage?.toFixed(2) || '',
        gradeRecord.overall_letter_grade || '',
      ];

      csv += row.join(',') + '\n';
    }

    return csv;
  }
}
