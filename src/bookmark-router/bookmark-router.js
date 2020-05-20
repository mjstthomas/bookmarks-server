const express = require('express')
const {v4: uuid }= require('uuid')
const { isWebUri } = require('valid-url')
const logger = require('../logger')
const store = require('../store')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

//create the route for bookmarks
bookmarksRouter
  .route('/bookmarks')
  .get((req, res) => {
    if (store.bookmarks.length === 0){
      res.send('Sorry, there are no bookmarks saved!')
    }
    res.json(store.bookmarks)
  })
  .post(bodyParser, (req, res) => {
    for (const input of ['title', 'url', 'rating']) {
      if (!req.body[input]) {
        logger.error(`${input} is required`)
        return res.status(400).send(`'${input}' is required`)
      }
    }
    const { title, url, description, rating } = req.body

    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
      logger.error(`Invalid rating: ${rating}`)
      return res.status(400).send(`the rating must be between 0 and 5`)
    }

    if (!isWebUri(url)) {
      logger.error(`Invalid url: ${url}`)
      return res
              .status(400)
              .send(`url must be valid`)
    }

    const bookmark = { 
      id: uuid(),
      title, 
      url, 
      description, 
      rating 
    }

    store.bookmarks.push(bookmark)

    logger.info(`Bookmark with id ${bookmark.id} created`)
    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
      .json(bookmark)
  })

//create the routes for bookmarks/id
bookmarksRouter
  .route('/bookmarks/:bookmark_id')
  .get((req, res) => {
    const { bookmark_id } = req.params

    const bookmark = store.bookmarks.find(item => item.id == bookmark_id)

    if (!bookmark) {
      logger.error(`Bookmark with id ${bookmark_id} not found.`)
      return res
        .status(404)
        .send('Bookmark Not Found')
    }

    res.json(bookmark)
  })
  .delete((req, res) => {
    const { bookmark_id } = req.params

    const bookmarkId = store.bookmarks.findIndex(item => item.id === bookmark_id)

    if (bookmarkId === -1) {
      logger.error(`Bookmark with id ${bookmark_id} not found.`)
      return res
        .status(404)
        .send('Bookmark not found')
    }
    const newStore = store.bookmarks.filter(item => item.id !== bookmark_id)
    store.bookmarks = newStore

    logger.info(`Bookmark with id ${bookmark_id} was successfully deleted.`)
    res
      .status(204)
      .end()
  })

module.exports = bookmarksRouter