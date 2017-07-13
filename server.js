const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(`${__dirname}/public`))

app.locals.links = {}

// app.get('/', (request, response) => {
//   response.sendFile('index.html')
// });

app.get('/api/v1/venues/cities/all', (req, res) => {
  database('cities').select()
  .then((cities) => {
    if(!cities){
      res.sendStatus(404).send({
        error: 'No cities by that name with music venues found'
      })
    } else {
      res.status(200).json(cities)
    }
  })
  .catch(() => {
    res.status(500)
  })
})


app.get('/api/v1/venues/all', (req, res) => {
  database('venues').select()
    .then((links) => {
      if(links.length) {
        res.status(200).json(links)
      } else {
        res.status(404).send({
          error: 'That doesn\'t seem to exist'
        })
      }
    })
    .catch(() => {
      res.status(500).send({
        error: 'Soooooomething went horribly wrong.'
      })
    })
})


app.get('/api/v1/venues/each_venue/:venue_name', (req, res) => {

  database('venues').where(database.raw('lower("venue_name")'), req.params.venue_name.toLowerCase()).select()

  .then((venue) => {
    if(!venue) {
      res.status(404).send({
        error: 'No venue was found by that name'
      })
    } else {
      res.status(200).json(venue)
    }
  }).catch((error) => {
    res.status(500)
  })
})


app.get('/api/v1/venues/cities/:city_name', (req, res) => {

  database('cities').where(database.raw('lower("city_name")'), req.params.city_name.toLowerCase()).select()
  .then((venue) => {
    console.log(venue[0].id);
    database('venues').where('city_id', venue[0].id)
    .then((venuesPerCity) => {
      console.log(venuesPerCity);
      if(!venuesPerCity) {
        res.status(404).send({
          error: 'No venue was found by that name!!!!!!!!!'
        })
      } else {
        res.status(200).json(venuesPerCity)
      }
    })
  }).catch((error) => {
    res.status(500)
  })
})
app.get('/api/v1/venues/all/cities/all/:state', (req, res) => {

  database('state').where(database.raw('lower("state")'), req.params.state.toLowerCase()).select()
  .then((cities) => {
    console.log(cities[0].id);
    database('cities').where('state_id', cities[0].id)
    .then((venues) => {
        ///burrow into cities table
      .then((venuesPerCity) => {
        console.log(venuesPerCity);
        if(!venuesPerCity) {
          res.status(404).send({
            error: 'No venue was found by that name!!!!!!!!!'
          })
        } else {
          res.status(200).json(venuesPerCity)
        }
      })
    })
  }).catch((error) => {
    res.status(500)
  })
})

app.get('/api/v1/city/venues', (req, res) => {
  database('links').select()
    .then((links) => {
      if(links.length) {
        res.status(200).json(links)
      } else {
        res.status(404).send({
          error: 'That doesn\'t seem to exist'
        })
      }
    })
    .catch(() => {
      res.status(500).send({
        error: 'Soooooomething went horribly wrong.'
      })
    })
})

app.get('/api/v1/state/venues', (req, res) => {
  database('links').select()
    .then((links) => {
      if(links.length) {
        res.status(200).json(links)
      } else {
        res.status(404).send({
          error: 'That doesn\'t seem to exist'
        })
      }
    })
    .catch(() => {
      res.status(500).send({
        error: 'Soooooomething went horribly wrong.'
      })
    })
})

app.post('/api/v1/links', (req, res) => {
  const link = req.body
  link.name = `${shortid.generate()}`

  if (!link.name) {
    return response.status(422).send({
      error: 'An error occurred generating a shortened url - please resubmit your link'
    })
  }

  for(let requiredParameter of ['url', 'folder']) {
    if(!link[requiredParameter]) {
      return res.status(422).send({
        error: `Yo, need a url and a folder name.
        You sent ${link}.`
      })
    }
  }

  database('links').insert(link, 'id')
    .then((newLink) => {
      res.status(201).json(newLink)
    })
    .catch(() => {
      res.status(500).send({ error: 'what the hell are you doing?'})
    })
})

app.get('/api/v1/links/click/:id', (req, res) => {
  const id = req.params.id
  database('links')
    .where('id', id)
    .increment('clicks', 1)
    .then(() => {
      return database('links')
            .where('id', id)
            .select('url')
    })
    .then((longLink) => {
      res.json(longLink)
    })
    .catch(() => {
      res.sendStatus(500)
    })
})

// app.delete('/api/v1/links/folder/:folder', (req, res) => {
//   const { folder } = req.params
//   database('links').where('folder', folder).del()
//     .then(() => {
//       res.sendStatus(200)
//     })
//     .catch(() => {
//       res.sendStatus(500)
//     })
// })
//
// app.delete('/api/v1/links/:id', (req, res) => {
//   const { id } = req.params
//   database('links').where('id', id).del()
//     .then(() => {
//       res.sendStatus(200)
//     })
//     .catch(() => {
//       res.sendStatus(500)
//     })
// })

app.listen(app.get('port'), () => {  //GET request is sent to this root/location and defining the response sent
  console.log(`${app.locals.title} is running on ${app.get('port')}.`) //logging what port the app is running at with the name - 'app.locals.title'...logged in terminal
});

module.exports = app
