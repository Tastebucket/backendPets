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

// PATCH -> update a toy
// PATCH /toys/:petId/:toyId
router.patch('/toys/:petId/:toyId', requireToken, removeBlanks, (req, res, next) => {
    // get and save the id's to variables
    const petId = req.params.petId
    const toyId = req.params.toyId

    // find our pet
    Pet.findById(petId)
        .then(handle404)
        .then(pet => {
            // single out the toy
            const theToy = pet.toys.id(toyId)
            // make sure the user is the pet's owner
            requireOwnership(req, pet)
            // update accordingly
            theToy.set(req.body.toy)

            return pet.save()
        })
        // send a status
        .then(() => res.sendStatus(204))
        .catch(next)
})

// DELETE -> destroy a toy
// DELETE /toys/:petId/:toyId
router.delete('/toys/:petId/:toyId', requireToken, (req, res, next) => {
    const petId = req.params.petId
    const toyId = req.params.toyId

    // find the pet
    Pet.findById(petId)
        .then(handle404)
        // grab the specific toy using it's id
        .then(pet => {
            // isolate the toy
            const theToy = pet.toys.id(toyId)
            // make sure the user is the owner of the pet
            requireOwnership(req, pet)
            // call remove on our toy subdoc
            theToy.remove()
            // return the saved pet
            return pet.save()
        })
        // send a response
        .then(() => res.sendStatus(204))
        // pass errors to our error handler (using next)
        .catch(next)
})

// export router
module.exports = router