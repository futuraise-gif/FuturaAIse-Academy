"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveClassController = void 0;
const firebase_1 = require("../config/firebase");
const types_1 = require("../types");
const uuid_1 = require("uuid");
// Jitsi Configuration (using free public server)
const JITSI_DOMAIN = process.env.JITSI_DOMAIN || 'meet.jit.si';
class LiveClassController {
    // Generate a unique room name for Jitsi
    static generateRoomName(title) {
        const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const randomId = (0, uuid_1.v4)().substring(0, 8);
        return `${cleanTitle}-${randomId}`;
    }
    // Create a live class
    static async createLiveClass(req, res) {
        try {
            const user = req.user;
            if (user.role !== types_1.UserRole.INSTRUCTOR && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Only instructors can create live classes' });
                return;
            }
            const { course_id, title, description, scheduled_at, duration_minutes = 60, } = req.body;
            if (!course_id || !title || !scheduled_at) {
                res.status(400).json({ error: 'Missing required fields' });
                return;
            }
            // Generate unique Jitsi room name
            const roomName = LiveClassController.generateRoomName(title);
            const roomUrl = `https://${JITSI_DOMAIN}/${roomName}`;
            // Save to Firestore
            const liveClassData = {
                id: (0, uuid_1.v4)(),
                course_id,
                instructor_id: user.userId,
                title,
                description: description || '',
                scheduled_at,
                duration_minutes,
                status: 'scheduled',
                room_id: roomName,
                room_code: roomUrl,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            await firebase_1.db.collection('live_classes').doc(liveClassData.id).set(liveClassData);
            res.status(201).json(liveClassData);
        }
        catch (error) {
            console.error('Error creating live class:', error);
            res.status(500).json({ error: 'Failed to create live class', details: error.message });
        }
    }
    // Get all live classes for a course
    static async getLiveClasses(req, res) {
        try {
            const user = req.user;
            const { course_id } = req.query;
            // For students, only show classes for courses they're enrolled in
            if (user.role === types_1.UserRole.STUDENT) {
                // Get all courses the student is enrolled in
                // Enrollments are stored as subcollections: courses/{courseId}/enrollments/{userId}
                const coursesSnapshot = await firebase_1.db.collection('courses').get();
                const enrolledCourseIds = [];
                // Check each course for user enrollment
                for (const courseDoc of coursesSnapshot.docs) {
                    const enrollmentDoc = await firebase_1.db
                        .collection('courses')
                        .doc(courseDoc.id)
                        .collection('enrollments')
                        .doc(user.userId)
                        .get();
                    if (enrollmentDoc.exists) {
                        const enrollmentData = enrollmentDoc.data();
                        // Only include active enrollments
                        if (enrollmentData?.status === 'active') {
                            enrolledCourseIds.push(courseDoc.id);
                        }
                    }
                }
                console.log('Student enrolled courses:', {
                    student_id: user.userId,
                    course_ids: enrolledCourseIds
                });
                if (enrolledCourseIds.length === 0) {
                    // Student not enrolled in any courses
                    res.json([]);
                    return;
                }
                // Get live classes for enrolled courses
                let liveClasses = [];
                // Firestore 'in' query supports max 10 values, so we need to batch if more courses
                const batchSize = 10;
                for (let i = 0; i < enrolledCourseIds.length; i += batchSize) {
                    const batch = enrolledCourseIds.slice(i, i + batchSize);
                    try {
                        // Try with orderBy (requires composite index)
                        const snapshot = await firebase_1.db
                            .collection('live_classes')
                            .where('course_id', 'in', batch)
                            .orderBy('scheduled_at', 'desc')
                            .get();
                        const batchClasses = snapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        }));
                        liveClasses.push(...batchClasses);
                    }
                    catch (indexError) {
                        // If index is still building, fetch without orderBy and sort in memory
                        if (indexError.code === 9) {
                            console.log('Student query - Index still building, fetching without orderBy...');
                            const snapshot = await firebase_1.db
                                .collection('live_classes')
                                .where('course_id', 'in', batch)
                                .get();
                            const batchClasses = snapshot.docs.map((doc) => ({
                                id: doc.id,
                                ...doc.data(),
                            }));
                            liveClasses.push(...batchClasses);
                        }
                        else {
                            throw indexError;
                        }
                    }
                }
                // Sort all classes by scheduled_at descending (newest first)
                liveClasses.sort((a, b) => {
                    return new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime();
                });
                // Enrich with course names
                const enrichedClasses = await Promise.all(liveClasses.map(async (liveClass) => {
                    try {
                        const courseDoc = await firebase_1.db.collection('courses').doc(liveClass.course_id).get();
                        return {
                            ...liveClass,
                            course_name: courseDoc.exists ? courseDoc.data()?.title : 'Unknown Course',
                        };
                    }
                    catch (err) {
                        return {
                            ...liveClass,
                            course_name: 'Unknown Course',
                        };
                    }
                }));
                res.json(enrichedClasses);
                return;
            }
            // For instructors/admins, show all or filtered by course_id
            let query = firebase_1.db.collection('live_classes');
            if (course_id) {
                query = query.where('course_id', '==', course_id);
            }
            // For instructors, only show their classes
            if (user.role === types_1.UserRole.INSTRUCTOR) {
                query = query.where('instructor_id', '==', user.userId);
            }
            let liveClasses = [];
            try {
                // Try with orderBy (requires composite index)
                const snapshot = await query.orderBy('scheduled_at', 'desc').get();
                liveClasses = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
            }
            catch (indexError) {
                // If index is still building, fetch without orderBy and sort in memory
                if (indexError.code === 9) {
                    console.log('Index still building, fetching without orderBy...');
                    const snapshot = await query.get();
                    liveClasses = snapshot.docs
                        .map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }))
                        .sort((a, b) => {
                        // Sort by scheduled_at descending (newest first)
                        return new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime();
                    });
                }
                else {
                    throw indexError;
                }
            }
            // Enrich with course names
            const enrichedClasses = await Promise.all(liveClasses.map(async (liveClass) => {
                try {
                    const courseDoc = await firebase_1.db.collection('courses').doc(liveClass.course_id).get();
                    return {
                        ...liveClass,
                        course_name: courseDoc.exists ? courseDoc.data()?.title : 'Unknown Course',
                    };
                }
                catch (err) {
                    return {
                        ...liveClass,
                        course_name: 'Unknown Course',
                    };
                }
            }));
            res.json(enrichedClasses);
        }
        catch (error) {
            console.error('Error fetching live classes:', error);
            res.status(500).json({ error: 'Failed to fetch live classes' });
        }
    }
    // Get live class by ID
    static async getLiveClassById(req, res) {
        try {
            const { classId } = req.params;
            const doc = await firebase_1.db.collection('live_classes').doc(classId).get();
            if (!doc.exists) {
                res.status(404).json({ error: 'Live class not found' });
                return;
            }
            res.json({ id: doc.id, ...doc.data() });
        }
        catch (error) {
            console.error('Error fetching live class:', error);
            res.status(500).json({ error: 'Failed to fetch live class' });
        }
    }
    // Join a live class (get auth token)
    static async joinLiveClass(req, res) {
        try {
            const user = req.user;
            const { classId } = req.params;
            const doc = await firebase_1.db.collection('live_classes').doc(classId).get();
            if (!doc.exists) {
                res.status(404).json({ error: 'Live class not found' });
                return;
            }
            const liveClass = doc.data();
            // Check if user is enrolled in the course or is the instructor
            if (user.role === types_1.UserRole.STUDENT) {
                // Check enrollment in the subcollection: courses/{courseId}/enrollments/{userId}
                const enrollmentDoc = await firebase_1.db
                    .collection('courses')
                    .doc(liveClass.course_id)
                    .collection('enrollments')
                    .doc(user.userId)
                    .get();
                if (!enrollmentDoc.exists || enrollmentDoc.data()?.status !== 'active') {
                    res.status(403).json({ error: 'You are not enrolled in this course' });
                    return;
                }
            }
            // Determine role in the room
            const role = user.userId === liveClass.instructor_id ? 'instructor' : 'student';
            // Get user display name
            const displayName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
            res.json({
                room_url: liveClass.room_code,
                room_id: liveClass.room_id,
                role,
                displayName,
            });
        }
        catch (error) {
            console.error('Error joining live class:', error);
            res.status(500).json({ error: 'Failed to join live class' });
        }
    }
    // Update live class status
    static async updateLiveClassStatus(req, res) {
        try {
            const user = req.user;
            const { classId } = req.params;
            const { status } = req.body;
            const doc = await firebase_1.db.collection('live_classes').doc(classId).get();
            if (!doc.exists) {
                res.status(404).json({ error: 'Live class not found' });
                return;
            }
            const liveClass = doc.data();
            // Only instructor or admin can update status
            if (user.userId !== liveClass.instructor_id && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            await firebase_1.db.collection('live_classes').doc(classId).update({
                status,
                updated_at: new Date().toISOString(),
            });
            res.json({ message: 'Status updated successfully' });
        }
        catch (error) {
            console.error('Error updating live class status:', error);
            res.status(500).json({ error: 'Failed to update status' });
        }
    }
    // Start recording
    static async startRecording(req, res) {
        try {
            const { classId } = req.params;
            const user = req.user;
            const doc = await firebase_1.db.collection('live_classes').doc(classId).get();
            if (!doc.exists) {
                res.status(404).json({ error: 'Live class not found' });
                return;
            }
            const liveClass = doc.data();
            // Only instructor can start recording
            if (user.userId !== liveClass.instructor_id) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            // Note: Jitsi recording is done in the browser via the UI
            // This endpoint is kept for compatibility but doesn't make API calls
            res.json({
                message: 'Recording can be started from the Jitsi interface',
                info: 'Click the three dots menu and select "Start recording"'
            });
        }
        catch (error) {
            console.error('Error starting recording:', error);
            res.status(500).json({ error: 'Failed to start recording' });
        }
    }
    // Stop recording
    static async stopRecording(req, res) {
        try {
            const { classId } = req.params;
            const user = req.user;
            const doc = await firebase_1.db.collection('live_classes').doc(classId).get();
            if (!doc.exists) {
                res.status(404).json({ error: 'Live class not found' });
                return;
            }
            const liveClass = doc.data();
            if (user.userId !== liveClass.instructor_id) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            const { recording_url } = req.body;
            // Save recording URL if provided
            if (recording_url) {
                await firebase_1.db.collection('live_classes').doc(classId).update({
                    recording_url,
                    updated_at: new Date().toISOString(),
                });
            }
            res.json({ message: 'Recording info saved', recording_url });
        }
        catch (error) {
            console.error('Error stopping recording:', error);
            res.status(500).json({ error: 'Failed to stop recording' });
        }
    }
}
exports.LiveClassController = LiveClassController;
//# sourceMappingURL=live-class.controller.js.map