import mongoose  from "mongoose";

const user=new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    conversationId:{
        type: String,
        required: true
    }
})

export default mongoose.model('user',user)