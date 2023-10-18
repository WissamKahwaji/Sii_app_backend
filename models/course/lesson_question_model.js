import mongoose from "mongoose";


const lessonQuestionsSchema = new mongoose.Schema({
    question: String,
    answers: {
        type: [String],
        default: [],
    },
});



export const lessonQuestionsModel = mongoose.model('LessonQuestions', lessonQuestionsSchema);