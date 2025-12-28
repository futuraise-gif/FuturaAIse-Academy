import { Request, Response } from 'express';
import { GradeModel } from '../models/grade.model';
import { AuthRequest } from '../types';
import { CreateGradeColumnDTO, UpdateGradeColumnDTO, UpdateGradeDTO } from '../types/grade.types';
import { CourseModel } from '../models/course.model';

export class GradeController {
  /**
   * Create a grade column
   */
  static async createColumn(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.uid;
      const data: CreateGradeColumnDTO = req.body;

      // Verify instructor owns the course
      const course = await CourseModel.findById(data.course_id);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (course.instructor_id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to create grade columns for this course' });
      }

      const column = await GradeModel.createColumn(userId, data);

      res.status(201).json({
        message: 'Grade column created successfully',
        column,
      });
    } catch (error: any) {
      console.error('Create grade column error:', error);
      res.status(500).json({ error: error.message || 'Failed to create grade column' });
    }
  }

  /**
   * Get all grade columns for a course
   */
  static async getColumns(req: AuthRequest, res: Response) {
    try {
      const { courseId } = req.params;

      const columns = await GradeModel.getColumns(courseId);

      res.json({
        message: 'Grade columns retrieved successfully',
        columns,
      });
    } catch (error: any) {
      console.error('Get grade columns error:', error);
      res.status(500).json({ error: error.message || 'Failed to retrieve grade columns' });
    }
  }

  /**
   * Update grade column
   */
  static async updateColumn(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.uid;
      const { courseId, columnId } = req.params;
      const updates: UpdateGradeColumnDTO = req.body;

      // Verify instructor owns the course
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (course.instructor_id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update this grade column' });
      }

      const column = await GradeModel.updateColumn(courseId, columnId, updates);

      if (!column) {
        return res.status(404).json({ error: 'Grade column not found' });
      }

      res.json({
        message: 'Grade column updated successfully',
        column,
      });
    } catch (error: any) {
      console.error('Update grade column error:', error);
      res.status(500).json({ error: error.message || 'Failed to update grade column' });
    }
  }

  /**
   * Delete grade column
   */
  static async deleteColumn(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.uid;
      const { courseId, columnId } = req.params;

      // Verify instructor owns the course
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (course.instructor_id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to delete this grade column' });
      }

      const success = await GradeModel.deleteColumn(courseId, columnId);

      if (!success) {
        return res.status(404).json({ error: 'Grade column not found' });
      }

      res.json({
        message: 'Grade column deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete grade column error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete grade column' });
    }
  }

  /**
   * Update a student's grade for a column
   */
  static async updateGrade(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.uid;
      const userName = req.user!.name || '';
      const { courseId, studentId, columnId } = req.params;
      const data: UpdateGradeDTO = req.body;

      // Verify instructor owns the course
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (course.instructor_id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update grades for this course' });
      }

      const gradeEntry = await GradeModel.updateGrade(
        courseId,
        studentId,
        columnId,
        userId,
        userName,
        data
      );

      res.json({
        message: 'Grade updated successfully',
        grade: gradeEntry,
      });
    } catch (error: any) {
      console.error('Update grade error:', error);
      res.status(500).json({ error: error.message || 'Failed to update grade' });
    }
  }

  /**
   * Get student's grades (for students)
   */
  static async getMyGrades(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.uid;
      const { courseId } = req.params;

      const gradeRecord = await GradeModel.getStudentGrades(courseId, userId);

      res.json({
        message: 'Grades retrieved successfully',
        gradeRecord,
      });
    } catch (error: any) {
      console.error('Get my grades error:', error);
      res.status(500).json({ error: error.message || 'Failed to retrieve grades' });
    }
  }

  /**
   * Get all students' grades (for instructor grade center)
   */
  static async getGradeCenter(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.uid;
      const { courseId } = req.params;

      // Verify instructor owns the course
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (course.instructor_id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to view grade center for this course' });
      }

      const columns = await GradeModel.getColumns(courseId);
      const allGrades = await GradeModel.getAllStudentGrades(courseId);

      res.json({
        message: 'Grade center data retrieved successfully',
        columns,
        students: allGrades,
      });
    } catch (error: any) {
      console.error('Get grade center error:', error);
      res.status(500).json({ error: error.message || 'Failed to retrieve grade center data' });
    }
  }

  /**
   * Get grade history for a student
   */
  static async getGradeHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.uid;
      const { courseId, studentId } = req.params;

      // Verify instructor owns the course or user is the student
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (
        course.instructor_id !== userId &&
        studentId !== userId &&
        req.user!.role !== 'admin'
      ) {
        return res.status(403).json({ error: 'Not authorized to view grade history' });
      }

      const history = await GradeModel.getGradeHistory(courseId, studentId);

      res.json({
        message: 'Grade history retrieved successfully',
        history,
      });
    } catch (error: any) {
      console.error('Get grade history error:', error);
      res.status(500).json({ error: error.message || 'Failed to retrieve grade history' });
    }
  }

  /**
   * Get statistics for a grade column
   */
  static async getColumnStatistics(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.uid;
      const { courseId, columnId } = req.params;

      // Verify instructor owns the course
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (course.instructor_id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to view statistics for this course' });
      }

      const statistics = await GradeModel.calculateColumnStatistics(courseId, columnId);

      if (!statistics) {
        return res.status(404).json({ error: 'No data available for statistics' });
      }

      res.json({
        message: 'Statistics retrieved successfully',
        statistics,
      });
    } catch (error: any) {
      console.error('Get column statistics error:', error);
      res.status(500).json({ error: error.message || 'Failed to retrieve statistics' });
    }
  }

  /**
   * Export grades to CSV
   */
  static async exportGrades(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.uid;
      const { courseId } = req.params;

      // Verify instructor owns the course
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (course.instructor_id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to export grades for this course' });
      }

      const csv = await GradeModel.exportGradesToCSV(courseId);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="grades-${courseId}.csv"`);
      res.send(csv);
    } catch (error: any) {
      console.error('Export grades error:', error);
      res.status(500).json({ error: error.message || 'Failed to export grades' });
    }
  }
}
