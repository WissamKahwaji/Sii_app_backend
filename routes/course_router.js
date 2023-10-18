import express from "express";
import { addAnswerToQuestion, addLessonQuestion, createCourse, createLesson, deleteLesson, editLesson, getAllCourses, getCourseById, getCourseLessons, getCoursesByCategory, getLessonById, getLessonQuestionById } from "../controllers/course_ctrl/course_ctrl.js";
import auth from "../middlewares/auth.js";

const router = express.Router();


router.get('/all', getAllCourses);
router.get('/:id', getCourseById);
router.get('/by-category', getCoursesByCategory);
router.post('/create', auth, createCourse);
router.get('/:id/all-lessons', auth, getCourseLessons);
router.get('/get-lesson/:lessonId', auth, getLessonById);
router.post('/:courseId/add-lesson', auth, createLesson);
router.put('/edit-lesson/:lessonId', auth, editLesson);
router.delete('/delete-lesson/:lessonId', auth, deleteLesson);
router.post('/add-lesson-question/:lessonId', auth, addLessonQuestion);
router.put('/add-question-answer/:questionId', auth, addAnswerToQuestion);
router.get('/lesson-question/:questionId', auth, getLessonQuestionById);
export default router;