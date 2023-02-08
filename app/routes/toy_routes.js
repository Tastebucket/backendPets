// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const Pet = require('../models/pet')


const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404

const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
const pet = require('../models/pet')

const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

//////////////
// ROUTES ////
//////////////

// POST

router.post('/toys/:petId', removeBlanks, (req, res, next) => {
    const toy = req.body.toy

    const petId = req.params.petId

    Pet.findById(petId)
        .then(handle404)
        .then(pet => {
            console.log('the pet: ', pet)
            console.log('the toy: ', toy)
            pet.toys.push(toy)
            return pet.save()
        })
        .then(pet => res.status(201).json({ pet: pet }))
        .catch(next)
})

// PATCH

// DELETE

// export router
module.exports = router