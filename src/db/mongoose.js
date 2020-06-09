const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})


// const task1 = new Task({
//     description: 'Practice node.js' ,
//     completed: true
// })

// task1.save().then(() => {
//     console.log(task1)
// }).catch((error) => {
//     console.log('Error! ',error)
// })