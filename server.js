if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
// express is a node.js webapp framework
const express = require('express') // import express from the express library that we installed npm
const app = express() // call express function to get the app portion 
const expressLayouts=require('express-ejs-layouts') // import express layout that we installed
const bodyParser=require('body-parser')
const methodOverride = require('method-override')

const indexRouter=require('./routes/index') // import index router
const movieRouter = require('./routes/movies')


app.set('view engine','ejs') // we use 'ejs' as our view engine, so pass in 'ejs'
app.set('views',__dirname+'/views') // we set where the 'views' are coming from. __dirname: current directory
app.set('layout','layouts/layout') // we hook up express layout.
app.use(expressLayouts) // we tell the express app that we want to use express layouts
app.use(express.static('public')) // we tell the express app where our public files are going to be
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))
app.use(methodOverride('_method'))

const mongoose = require ('mongoose') // import mongoose
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))


app.use('/',indexRouter) // use index router
app.use('/movies', movieRouter)


app.listen(process.env.PORT || 3000)




