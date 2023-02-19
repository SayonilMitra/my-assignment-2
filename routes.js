const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const [userModel, postModel] = require('./model.js')

router.post('/register', (req, res) => {
    let { name, email, password } = req.body
    // create user
    async function createUser() {
        try {
            newUser = await new userModel({
                name: name,
                email: email,
                password: password
            })
            newUser.save()
            // send response
            res.writeHead('200', { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({
                "status": "success",
                "data": {
                    ...newUser["_doc"]
                }
            }))
        } catch (error) {
            console.log(error.message)
        }
    }
    createUser()
})

router.post('/login', (req, res) => {
    let { email, password } = req.body
    // check email password
    async function checkUser() {
        try {
            // fetch password of matching user email
            let user = await userModel.findOne({ email: email }, 'password')
            if (user['password'] === password) {
                // generate token
                let token = jwt.sign(
                    { userEmail: user['email'], userPassword: user['password'] },
                    'dogs_are_cute'
                )
                // send response with token
                res.end(JSON.stringify({
                    "status": "success",
                    "token": token
                }))
            }
        } catch (error) {
            console.log(error.message)
        }
    }
    checkUser()
})

router.route('/posts')
    .get((req, res) => {
        // get all posts
        async function getPosts() {
            let posts = await postModel.find()
            // send response
            res.end(JSON.stringify({
                "posts": posts
            }))
        }
        getPosts()
    })
    .post((req, res) => {
        let { title, body, image } = req.body
        let token = req.headers.authorization.split(' ')[1]
        let docodedToken = jwt.verify(token, 'dogs_are_cute')
        //create post
        try {
            async function createPost() {
                let newPost = await new postModel({
                    title: title,
                    body: body,
                    image: image,
                    user: docodedToken["userEmail"]
                })
                await newPost.save()
                res.end(JSON.stringify({
                    "status": "post created",
                    "data": {
                        ...newPost._doc
                    }
                }))
            }
            createPost()
        } catch (error) {
            console.log(error.message)
        }

    })

router.route('/posts/:postId')
    .put((req, res) => {
        let postId = req.params.postId
        let { title, body, image } = req.body
        // get token
        let token = req.headers.authorization.split(' ')[1]
        let decodedToken = jwt.verify(token, 'dogs_are_cute')
        try {
            async function fetchPost() {
                // get post to be updated
                let post = await postModel.findOne({ _id: postId })
                if (title) {
                    post.title = title
                }
                if (body) {
                    post.body = body
                }
                if (image) {
                    post.image = image
                }
                await post.save()
                // send response
                res.end(JSON.stringify(
                    {
                        "status": "success"
                    }
                ))
            }
            fetchPost()
        } catch (error) {
            console.log(error.message)
        }
    })
    .delete((req, res) => {
        let postId = req.params.postId
        // get token
        let token = req.headers.authorization.split(' ')[1]
        let decodedToken = jwt.verify(token, 'dogs_are_cute')
        try {
            async function deletePost() {
                // delete post
                await postModel.deleteOne({ _id: postId })
                // send response
                res.end(JSON.stringify(
                    {
                        "status": "success"
                    }
                ))
            }
            deletePost()
        } catch (error) {
            console.log(error.message)
        }
    })


module.exports = router