const express = require('express')
const mongoose = require ('mongoose')
const router = express.Router()
const Movie = require('../models/movie')
const { emit } = require('../models/movie')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

// All Movies Route
router.get('/', async (req, res) => {
  let query = Movie.find()
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  if (req.query.releasedBefore != null && req.query.releasedBefore != '') {
    query = query.lte('releaseDate', req.query.releasedBefore)
  }
  if (req.query.releasedAfter != null && req.query.releasedAfter != '') {
    query = query.gte('releaseDate', req.query.releasedAfter)
  }
  try {
    const movies = await query.exec()
    res.render('movies/index', {
      movies: movies,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New Movie Route
router.get('/new', async (req, res) => {
  renderNewPage(res, new Movie())
})

// Create Movie Route
router.post('/', async (req, res) => {
  const movie = new Movie({
    title: req.body.title,
    voteAverage: req.body.voteAverage,
    popularity: req.body.popularity,
    releaseDate: new Date(req.body.releaseDate),
    overview: req.body.overview
  })
  saveCover(movie, req.body.cover)

  try {
    const newMovie = await movie.save()
    res.redirect(`movies/${newMovie.id}`)
  } catch {
    renderNewPage(res, movie, true)
  }
})

// Show Movie Route
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)

    res.render('movies/show', { movie: movie })
  } catch {
    res.redirect('/')
  }
})

// Edit Movie Route
router.get('/:id/edit', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)
    renderEditPage(res, movie)
  } catch {
    res.redirect('/')
  }
})

// Update Movie Route
router.put('/:id', async (req, res) => {
  let movie

  try {
    movie = await Movie.findById(req.params.id)
    movie.title = req.body.title,
    movie.voteAverage = req.body.voteAverage,
    movie.popularity = req.body.popularity,
    movie.releaseDate = new Date(req.body.releaseDate),

    movie.overview = req.body.overview

    if (req.body.cover != null && req.body.cover !== '') {
      saveCover(movie, req.body.cover)
    }
    await movie.save()
    res.redirect(`/movies/${movie.id}`)
  } catch {
    if (movie != null) {
      renderEditPage(res, movie, true)
    } else {
      redirect('/')
    }
  }
})

// Delete Movie Page
router.delete('/:id', async (req, res) => {
  let movie
  try {
    movie = await Movie.findById(req.params.id)
    await movie.remove()
    res.redirect('/movies')
  } catch {
    if (movie != null) {
      res.render('movies/show', {
        movie: movie,
        errorMessage: 'Could not remove movie'
      })
    } else {
      res.redirect('/')
    }
  }
})

async function renderNewPage(res, movie, hasError = false) {
  renderFormPage(res, movie, 'new', hasError)
}

async function renderEditPage(res, movie, hasError = false) {
  renderFormPage(res, movie, 'edit', hasError)
}

async function renderFormPage(res, movie, form, hasError = false) {
  try {
    const movies = await Movie.find({})
    const params = {
      title: movies,
      movie: movie
    }
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating Movie'
      } else {
        params.errorMessage = 'Error Creating Movie'
      }
    }
    res.render(`movies/${form}`, params)
  } catch {
    res.redirect('/movies')
  }
}

function saveCover(movie, coverEncoded) {
  if (coverEncoded == null) return
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    movie.coverImage = new Buffer.from(cover.data, 'base64')
    movie.coverImageType = cover.type
  }
}

module.exports = router