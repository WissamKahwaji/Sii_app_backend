

import mongoose from "mongoose";


const lessonSchema = new mongoose.Schema({
    name: String,
    img: String,
    duration: String,
    videoUrl: String,
    learningPoints: {
        type: [String],
        default: [],
    },
    lessonQuestions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "LessonQuestions",
        default: [],
    }]
});



export const lessonModel = mongoose.model('Lessons', lessonSchema);