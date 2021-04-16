const mongoose = require('mongoose')
const Book = require('./book')

//mongoose스키마 객체로 authorSchema 만듦
const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

authorSchema.pre('remove', function(next) {
    Book.find({ author: this.id }, (err, books) => {
      if (err) {
        next(err)
      } else if (books.length > 0) {
        next(new Error('This author has books still'))
      } else {
        next()
      }
    })
  })

// mongoose 스키마 내보내기 사용. mongoose.model('모델이름',해당스키마)
module.exports = mongoose.model('Author', authorSchema)

