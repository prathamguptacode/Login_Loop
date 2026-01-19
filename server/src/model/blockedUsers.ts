import mongoose from 'mongoose';

//set ttl in it

const Blockeduser = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    conversationId: {
        type: String,
        required: true,
    },
    
});

export default mongoose.model('blockedUser', Blockeduser);
