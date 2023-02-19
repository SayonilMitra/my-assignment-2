const mongoose = require('mongoose')
mongoose.set('strictQuery', false);
const userSchema = mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    password: String
})
const postSchema = mongoose.Schema({
    title: String,
    body: String,
    image: String,
    user: String
})

const userModel = mongoose.model('User', userSchema)
const postModel = mongoose.model('Post', postSchema)

mongoose.connect('mongodb://localhost:27017/assignment')

module.exports = [userModel, postModel]