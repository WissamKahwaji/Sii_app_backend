import { courseModel } from "../../models/course/course_model.js";
import { lessonModel } from "../../models/course/lesson_model.js";
import { lessonQuestionsModel } from "../../models/course/lesson_question_model.js";


export const getAllCourses = async (req, res) => {
    try {
        const courses = await courseModel.find().populate('lessons');
        return res.status(200).json(courses);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await courseModel.findById(id).populate('Lessons');
        return res.status(200).json(course);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const getCoursesByCategory = async (req, res) => {
    try {
        const { category } = req.query;
        const courses = await courseModel.find({ category: category }).populate('Lessons');
        return res.status(200).json(courses);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
}

export const createCourse = async (req, res) => {
    try {
        console.log(req.userId);
        const owner = req.userId;
        const {
            name,
            price,
            duration,
            session,
            review,
            description,
            category,
        } = req.body;

        const imgPath = req.files['img'][0].path;
        const urlImg = 'http://localhost:5000/' + imgPath.replace(/\\/g, '/');


        const newCourse = new courseModel({
            owner,
            name,
            img: urlImg,
            price,
            duration,
            session,
            review,
            description,
            category,
        });


        const savedCourse = await newCourse.save();

        return res.status(201).json(savedCourse);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const getCourseLessons = async (req, res) => {
    try {
        const { courseId } = req.params;
        const lessons = await courseModel.findById(courseId).populate('lessons').select1('lessons');
        return res.status(200).json(lessons);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const getLessonById = async (req, res) => {
    try {
        const { lessonId } = req.params;

        const lesson = await lessonModel.findById(lessonId).populate('lessonQuestions');
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        return res.status(200).json({
            message: 'Lesson found successfully',
            data: lesson,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};


export const createLesson = async (req, res) => {
    try {
        const { courseId } = req.params;
        const {
            name,
            duration,
            learningPoints,
        } = req.body;
        const image = req.files['img'][0];
        if (!image) {
            return res.status(404).json({ message: 'Attached file is not an image.' });
        }
        const urlImage = 'http://localhost:5000/' + image.path.replace(/\\/g, '/');

        const newLesson = new lessonModel({
            name,
            img: urlImage,
            duration,
            learningPoints,
        });

        if (req.files['video']) {
            const video = req.files['video'][0];
            const urlVideo = 'http://localhost:5000/' + video.path.replace(/\\/g, '/');
            newLesson.videoUrl = urlVideo;
        }


        const savedLesson = await newLesson.save();

        const course = await courseModel.findById(courseId);
        const lessonCourse = course.lessons;
        lessonCourse.push(savedLesson._id);

        course.lessons = lessonCourse;
        await course.save();
        return res.status(201).json(savedLesson);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};


export const editLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const {
            name,
            duration,
            learningPoints,
        } = req.body;

        const updatedLessonData = {};

        if (name) {
            updatedLessonData.name = name;
        }

        if (duration) {
            updatedLessonData.duration = duration;
        }

        if (Array.isArray(learningPoints)) {

            updatedLessonData.learningPoints = learningPoints;
        }

        if (req.files['img']) {
            const image = req.files['img'][0];
            if (!image) {
                return res.status(404).json({ message: 'Attached file is not an image.' });
            }
            const urlImage = 'http://localhost:5000/' + image.path.replace(/\\/g, '/');
            updatedLessonData.img = urlImage;
        }

        if (req.files['video']) {
            const video = req.files['video'][0];
            const urlVideo = 'http://localhost:5000/' + video.path.replace(/\\/g, '/');
            updatedLessonData.videoUrl = urlVideo;
        }

        const updatedLesson = await lessonModel.findByIdAndUpdate(
            lessonId,
            { $set: updatedLessonData },
            { new: true }
        );

        if (!updatedLesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        return res.status(200).json(updatedLesson);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};


export const deleteLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;

        const lesson = await lessonModel.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }


        const lessonQuestionIds = lesson.lessonQuestions;


        await lessonModel.findByIdAndRemove(lessonId);


        if (lessonQuestionIds.length > 0) {
            await lessonQuestionsModel.deleteMany({ _id: { $in: lessonQuestionIds } });
        }

        return res.status(200).json({ message: 'Lesson and related LessonQuestions deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const addLessonQuestion = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const { question } = req.body;

        const lesson = await lessonModel.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        const newLessonQuestion = new lessonQuestionsModel({
            question: question,
        });

        await newLessonQuestion.save();

        lesson.lessonQuestions.push(newLessonQuestion._id);

        await lesson.save();
        return res.status(201).json({
            message: 'Lesson question added successfully',
            data: newLessonQuestion,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};


export const addAnswerToQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { answer } = req.body;

        const lessonQuestion = await lessonQuestionsModel.findById(questionId);
        if (!lessonQuestion) {
            return res.status(404).json({ message: 'Lesson question not found' });
        }


        if (answer) {
            lessonQuestion.answers.push(answer);
            await lessonQuestion.save();

            return res.status(200).json({
                message: 'Answer added to the lesson question successfully',
                data: lessonQuestion,
            });
        } else {
            return res.status(400).json({ message: 'Invalid answer data' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const getLessonQuestionById = async (req, res) => {
    try {
        const { questionId } = req.params;

        const lessonQuestion = await lessonQuestionsModel.findById(questionId);
        if (!lessonQuestion) {
            return res.status(404).json({ message: 'Lesson question not found' });
        }

        return res.status(200).json({
            message: 'Lesson question found successfully',
            data: lessonQuestion,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};