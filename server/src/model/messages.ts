import mongoose from "mongoose";

const message=new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    coversation:{
        type:{
            user: String,
            logicLoop: String,
        },
        required: true
    }
})

export default mongoose.model('message',message)