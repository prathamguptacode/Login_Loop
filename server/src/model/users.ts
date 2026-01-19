import mongoose from 'mongoose';

const user = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    conversationId: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
    },
    password: String,
    name: String,
    subscriber: {
        type: Boolean,
        default: false,
    },
    messageNumber: {
        type: Number,
        default: 0,
    },
    instruction: String,
});

export default mongoose.model('user', user);
