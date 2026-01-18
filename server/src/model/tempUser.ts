import mongoose, { Mongoose } from "mongoose";

const tempUserSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true
    },
    history:{
        type: [mongoose.Schema.Types.Mixed],
        require: true
    }
})