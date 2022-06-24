const mongoose = require('mongoose')

const mapSchema = new mongoose.Schema({
    value: {
      type: Number,
      required: true
    }
  })

  module.exports = mongoose.model('Map', mapSchema)