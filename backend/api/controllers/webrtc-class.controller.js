"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endWebRTCClass = exports.startWebRTCClass = exports.getAllWebRTCClasses = exports.getStudentWebRTCClasses = exports.getInstructorWebRTCClasses = exports.createWebRTCClass = void 0;
const firebase_1 = require("../config/firebase");
const firestore_1 = require("firebase-admin/firestore");
const webrtcClassesCollection = firebase_1.db.collection('webrtc_classes');
const coursesCollection = firebase_1.db.collection('courses');
// Create a new WebRTC class
const createWebRTCClass = async (req, res) => {
    try {
        const { course_id, title, description, scheduled_at, duration_minutes } = req.body;
        const instructorId = req.user?.userId;
        if (!instructorId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Verify course exists
        const courseDoc = await coursesCollection.doc(course_id).get();
        if (!courseDoc.exists) {
            return res.status(404).json({ error: 'Course not found' });
        }
        // Generate unique room ID
        const roomId = `webrtc-${course_id}-${Date.now()}`;
        const webrtcClass = {
            course_id,
            instructor_id: instructorId,
            room_id: roomId,
            title,
            description: description || '',
            scheduled_at: firestore_1.Timestamp.fromDate(new Date(scheduled_at)),
            duration_minutes: parseInt(duration_minutes),
            status: 'scheduled',
            created_at: firestore_1.Timestamp.now(),
            updated_at: firestore_1.Timestamp.now(),
        };
        const docRef = await webrtcClassesCollection.add(webrtcClass);
        res.status(201).json({
            id: docRef.id,
            ...webrtcClass,
            scheduled_at: webrtcClass.scheduled_at.toDate().toISOString(),
            created_at: webrtcClass.created_at.toDate().toISOString(),
            updated_at: webrtcClass.updated_at.toDate().toISOString(),
        });
    }
    catch (error) {
        console.error('Error creating WebRTC class:', error);
        res.status(500).json({ error: 'Failed to create WebRTC class' });
    }
};
exports.createWebRTCClass = createWebRTCClass;
// Get WebRTC classes for instructor
const getInstructorWebRTCClasses = async (req, res) => {
    try {
        const instructorId = req.user?.userId;
        if (!instructorId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        let snapshot;
        try {
            // Try with orderBy (requires composite index)
            snapshot = await webrtcClassesCollection
                .where('instructor_id', '==', instructorId)
                .orderBy('scheduled_at', 'desc')
                .get();
        }
        catch (indexError) {
            // If index is still building, fetch without orderBy and sort in memory
            if (indexError.code === 9 || indexError.message?.includes('index')) {
                console.log('Index still building for WebRTC classes, fetching without orderBy...');
                snapshot = await webrtcClassesCollection
                    .where('instructor_id', '==', instructorId)
                    .get();
            }
            else {
                throw indexError;
            }
        }
        const classes = await Promise.all(snapshot.docs.map(async (doc) => {
            const data = doc.data();
            // Get course name
            const courseDoc = await coursesCollection.doc(data.course_id).get();
            const courseName = courseDoc.exists ? courseDoc.data()?.title : 'Unknown Course';
            return {
                id: doc.id,
                ...data,
                course_name: courseName,
                scheduled_at: data.scheduled_at.toDate().toISOString(),
                created_at: data.created_at.toDate().toISOString(),
                updated_at: data.updated_at.toDate().toISOString(),
            };
        }));
        // Sort in memory if we couldn't use orderBy
        classes.sort((a, b) => {
            return new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime();
        });
        res.json(classes);
    }
    catch (error) {
        console.error('Error fetching instructor WebRTC classes:', error);
        res.status(500).json({ error: 'Failed to fetch WebRTC classes' });
    }
};
exports.getInstructorWebRTCClasses = getInstructorWebRTCClasses;
// Get WebRTC classes for student (enrolled courses only)
const getStudentWebRTCClasses = async (req, res) => {
    try {
        const studentId = req.user?.userId;
        if (!studentId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Get student's enrolled courses
        // Enrollments are stored as subcollections: courses/{courseId}/enrollments/{userId}
        const coursesSnapshot = await coursesCollection.get();
        const courseIds = [];
        console.log('Student WebRTC - Checking enrollments for student:', studentId);
        console.log('Total courses to check:', coursesSnapshot.docs.length);
        // Check each course for user enrollment
        for (const courseDoc of coursesSnapshot.docs) {
            const enrollmentDoc = await coursesCollection
                .doc(courseDoc.id)
                .collection('enrollments')
                .doc(studentId)
                .get();
            if (enrollmentDoc.exists) {
                const enrollmentData = enrollmentDoc.data();
                console.log('Found enrollment for course:', courseDoc.id, 'status:', enrollmentData?.status);
                // Only include active enrollments
                if (enrollmentData?.status === 'active') {
                    courseIds.push(courseDoc.id);
                }
            }
        }
        console.log('Student enrolled course IDs:', courseIds);
        if (courseIds.length === 0) {
            console.log('No enrolled courses found for student, returning empty array');
            return res.json([]);
        }
        // Get WebRTC classes for enrolled courses
        // Note: Firestore 'in' queries support up to 10 items
        const classesPromises = [];
        for (let i = 0; i < courseIds.length; i += 10) {
            const batch = courseIds.slice(i, i + 10);
            const batchPromise = (async () => {
                try {
                    // Try with orderBy
                    console.log('Fetching WebRTC classes for course batch:', batch);
                    return await webrtcClassesCollection
                        .where('course_id', 'in', batch)
                        .orderBy('scheduled_at', 'asc')
                        .get();
                }
                catch (indexError) {
                    // If index is still building, fetch without orderBy
                    if (indexError.code === 9 || indexError.message?.includes('index')) {
                        console.log('Index still building for student WebRTC classes, fetching without orderBy...');
                        return await webrtcClassesCollection
                            .where('course_id', 'in', batch)
                            .get();
                    }
                    throw indexError;
                }
            })();
            classesPromises.push(batchPromise);
        }
        const snapshots = await Promise.all(classesPromises);
        const allDocs = snapshots.flatMap((snapshot) => snapshot.docs);
        console.log('Found WebRTC class documents:', allDocs.length);
        const classes = await Promise.all(allDocs.map(async (doc) => {
            const data = doc.data();
            console.log('WebRTC class data:', {
                id: doc.id,
                course_id: data.course_id,
                title: data.title,
                status: data.status
            });
            // Get course name
            const courseDoc = await coursesCollection.doc(data.course_id).get();
            const courseName = courseDoc.exists ? courseDoc.data()?.title : 'Unknown Course';
            return {
                id: doc.id,
                ...data,
                course_name: courseName,
                scheduled_at: data.scheduled_at.toDate().toISOString(),
                created_at: data.created_at.toDate().toISOString(),
                updated_at: data.updated_at.toDate().toISOString(),
            };
        }));
        // Filter to only show scheduled and live classes (not ended)
        const activeClasses = classes.filter((c) => c.status === 'scheduled' || c.status === 'live');
        // Sort in memory by scheduled_at
        activeClasses.sort((a, b) => {
            return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
        });
        console.log('Total WebRTC classes found:', classes.length);
        console.log('Active WebRTC classes (scheduled/live):', activeClasses.length);
        console.log('Returning WebRTC classes to student:', activeClasses.length);
        res.json(activeClasses);
    }
    catch (error) {
        console.error('Error fetching student WebRTC classes:', error);
        res.status(500).json({ error: 'Failed to fetch WebRTC classes' });
    }
};
exports.getStudentWebRTCClasses = getStudentWebRTCClasses;
// Get all WebRTC classes (admin only)
const getAllWebRTCClasses = async (req, res) => {
    try {
        const userRole = req.user?.role;
        console.log('getAllWebRTCClasses - User role:', userRole);
        if (userRole === 'student') {
            console.log('Routing to getStudentWebRTCClasses');
            return (0, exports.getStudentWebRTCClasses)(req, res);
        }
        if (userRole === 'instructor') {
            console.log('Routing to getInstructorWebRTCClasses');
            return (0, exports.getInstructorWebRTCClasses)(req, res);
        }
        // Admin/Super Admin - get all classes
        let snapshot;
        try {
            snapshot = await webrtcClassesCollection.orderBy('scheduled_at', 'desc').get();
        }
        catch (indexError) {
            // If index is still building, fetch without orderBy
            if (indexError.code === 9 || indexError.message?.includes('index')) {
                console.log('Index still building for admin WebRTC classes, fetching without orderBy...');
                snapshot = await webrtcClassesCollection.get();
            }
            else {
                throw indexError;
            }
        }
        const classes = await Promise.all(snapshot.docs.map(async (doc) => {
            const data = doc.data();
            // Get course name
            const courseDoc = await coursesCollection.doc(data.course_id).get();
            const courseName = courseDoc.exists ? courseDoc.data()?.title : 'Unknown Course';
            return {
                id: doc.id,
                ...data,
                course_name: courseName,
                scheduled_at: data.scheduled_at.toDate().toISOString(),
                created_at: data.created_at.toDate().toISOString(),
                updated_at: data.updated_at.toDate().toISOString(),
            };
        }));
        // Sort in memory
        classes.sort((a, b) => {
            return new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime();
        });
        res.json(classes);
    }
    catch (error) {
        console.error('Error fetching all WebRTC classes:', error);
        res.status(500).json({ error: 'Failed to fetch WebRTC classes' });
    }
};
exports.getAllWebRTCClasses = getAllWebRTCClasses;
// Start a WebRTC class (change status to 'live')
const startWebRTCClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const instructorId = req.user?.userId;
        const classDoc = await webrtcClassesCollection.doc(classId).get();
        if (!classDoc.exists) {
            return res.status(404).json({ error: 'Class not found' });
        }
        const classData = classDoc.data();
        // Verify instructor owns this class or is admin
        if (classData?.instructor_id !== instructorId && req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        await webrtcClassesCollection.doc(classId).update({
            status: 'live',
            updated_at: firestore_1.Timestamp.now(),
        });
        res.json({ message: 'Class started successfully', room_id: classData?.room_id });
    }
    catch (error) {
        console.error('Error starting WebRTC class:', error);
        res.status(500).json({ error: 'Failed to start class' });
    }
};
exports.startWebRTCClass = startWebRTCClass;
// End a WebRTC class (change status to 'ended')
const endWebRTCClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const instructorId = req.user?.userId;
        const classDoc = await webrtcClassesCollection.doc(classId).get();
        if (!classDoc.exists) {
            return res.status(404).json({ error: 'Class not found' });
        }
        const classData = classDoc.data();
        // Verify instructor owns this class or is admin
        if (classData?.instructor_id !== instructorId && req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        await webrtcClassesCollection.doc(classId).update({
            status: 'ended',
            updated_at: firestore_1.Timestamp.now(),
        });
        res.json({ message: 'Class ended successfully' });
    }
    catch (error) {
        console.error('Error ending WebRTC class:', error);
        res.status(500).json({ error: 'Failed to end class' });
    }
};
exports.endWebRTCClass = endWebRTCClass;
//# sourceMappingURL=webrtc-class.controller.js.map