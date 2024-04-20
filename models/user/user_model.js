
import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
    },
    mobileNumber: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
        // required: true,
    },

},

    {

        toJSON: {
            select: '-password'
        }
    },
    { timestamps: true }
);





export const userModel = mongoose.model('Users', userSchema);