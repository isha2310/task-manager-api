const express = require('express')
const sharp = require('sharp')
const multer = require('multer')
const User = require('../models/user')
const auth = require('../middleware/authentication')
const {sendWelcomeMail , sendCancellationMail} = require('../email/account')

const router = express.Router()

router.post('/users', async (req,res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeMail(user.email , user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user , token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login' , async (req,res) => {
    try {
        const user = await User.findByEmail(req.body.email , req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user , token})
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth , async(req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth , async(req,res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me',auth, async (req,res) => {
    res.send(req.user)
})

router.patch('/users/me' , auth , async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedValidation = ['name' , 'email' , 'password' , 'age']
    const isValid = updates.every((update) => allowedValidation.includes(update))
    if (! isValid) {
        return res.status(400).send({error : 'Invalid data'})
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me' , auth, async (req,res) => {
    try {
        await req.user.remove()
        sendCancellationMail(req.user.email , req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})


const upload = multer({ 
    limits: {
        fileSize: 1000000 
    } ,
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error ('Upload an image'))
        }
        cb(undefined, true)
    }
})
router.post('/users/me/snap' , auth , upload.single('snap') , async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.snap = buffer
    await req.user.save()
    res.send()
} , (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/snap' , auth , async (req,res) => {
    req.user.snap = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/snap' , async (req,res) => {
    try{
        const user = await User.findById(req.params.id)
        if (!user || !user.snap) {
            throw new Error()
        }
        res.set('Content-Type' , 'image/png')
        res.send(user.snap)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router