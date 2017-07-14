const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
const config = require('dotenv').config().parsed;

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(`${__dirname}/public`))

app.locals.links = {}


if (process.env.NODE_ENV === 'development' && (!config.CLIENT_SECRET || !config.USERNAME || !config.PASSWORD)) {
  throw new Error('Either CLIENT_SECRET, USERNAME, or PASSWORD is missing from .env file');
}

app.set('secretKey', process.env.CLIENT_SECRET || config.CLIENT_SECRET);
const token = jwt.sign('token', app.get('secretKey'));

const checkAuth = (request, response, next) => {
  const authToken = request.body.token ||
                request.param.token ||
                request.headers['authorization'];

  if (authToken) {
    jwt.verify(authToken, app.get('secretKey'), (error, decoded) => {
      if (error) {
        return response.status(403).send({
          success: false,
          message: 'Invalid authorization token.'
        });
      }
      else {
        request.decoded = decoded;
        next();
      }
    });
  }

  else {
    return response.status(403).send({
      success: false,
      message: 'You must be authorized to hit this endpoint'
    });
  }
};

app.post('/authenticate', (request, response) => {
  const user = request.body;

  if (user.username !== config.USERNAME || user.password !== config.PASSWORD) {
    response.status(403).send({
      success: false,
      message: 'Invalid Credentials'
    });
  }

  else {
    var token = jwt.sign(user, app.get('secretKey'), {
      expiresIn: 2025000
    });

    response.json({
      success: true,
      username: user.username,
      token: token
    });
  }
});


app.get('/api/v1/venues/cities/all', (req, res) => {
  database('cities').select()
  .then((cities) => {
    if(!cities.length){
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
    if(!venue.length) {
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


app.get('/api/v1/venues/cities/name/:city_name', (req, res) => {

  database('cities').where(database.raw('lower("city_name")'), req.params.city_name.toLowerCase()).select()
  .then((venue) => {
    database('venues').where('city_id', venue[0].id)
    .then((venuesPerCity) => {
      if(!venuesPerCity.length) {
        res.status(404).send({
          error: 'No venue was found by that name'
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

  database('states').where(database.raw('lower("state")'), req.params.state.toLowerCase()).select()
  .then((cities) => {
    database('cities').where('state_id', cities[0].id)
    .then((venues) => {
      const stateCityArr = []
      venues.forEach(venue =>{
        stateCityArr.push(database('venues').where('city_id', venue.id))

      })
      Promise.all(stateCityArr)
      .then((venuesPerCity) => {
        if(!venuesPerCity.length) {
          res.status(404).send({
            error: 'No venue was found by that name'
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


app.post("/api/v1/venues", checkAuth, (req, res) => {

  const expectedReq = ["venue_name", "city_name", "state_name"];
  const missingInfo = expectedReq.every(params => req.body[params]);
  var newVenue = req.body;
  if (!missingInfo) {
    return res.status(422).send({
      error: "Missing information from post request body, your request must contain a venue_name, city_name and stat_name to be processed"
    })
  }

  database("cities").where(database.raw('lower("city_name")'), newVenue.city_name.toLowerCase())
  .then((id) => {
    if(!id.length){
      database("states").where(database.raw('lower("state")'), newVenue.state_name.toLowerCase())
      .then(stateRes => {
        database("cities").insert({
          state: stateRes[0].state,
          state_id: stateRes[0].id,
          city_name: newVenue.city_name
        }, 'id')
        .then((res) => {
          database("venues").insert({
            venue_name: newVenue.venue_name,
            venue_URL: newVenue.venue_URL,
            venue_booking: newVenue.venue_booking,
            venue_phone: newVenue.venue_phone,
            venue_booking_contact: newVenue.venue_booking_contact,
            venue_PA_status: newVenue.venue_PA_status,
            venue_comments: newVenue.venue_comments,
            city_id: res
          }, 'id')
        })
        .then(() => {
          res.status(201).send({
            success: `${newVenue.venue_name}, in ${newVenue.city_name}, ${newVenue.state_name} has been added`
          })
        }).catch((error) => {
          res.status(500)
        });
      })
    } else {
      database("venues").insert({
        venue_name: newVenue.venue_name,
        venue_URL: newVenue.venue_URL,
        venue_booking: newVenue.venue_booking,
        venue_phone: newVenue.venue_phone,
        venue_booking_contact: newVenue.venue_booking_contact,
        venue_PA_status: newVenue.venue_PA_status,
        venue_comments: newVenue.venue_comments,
        city_id: id[0].id
      }, 'id')
      .then(() => {
        res.status(201).send({
          success: `${newVenue.venue_name}, in ${newVenue.city_name}, ${newVenue.state_name} has been added`
        })
      }).catch((error) => {
        res.status(500)
      });
    }
  })
})

app.delete('/api/v1/venues/id/:id', checkAuth, (req, res) => {

  const { id } = req.params;
  database('venues').where('id', id).select()
    .then((resp) => {
      if (!resp.length) {
        res.status(404).send({ error: 'Invalid Venue ID' });
      } else {
        database('venues').where('id', id).del()
        .then(() => {
          res.status(204).send({
            success: `venue has been deleted`
          })
        })
        .catch((error) => {
          res.status(500).send({ error });
        });
      }
  });
});

app.delete('/api/v1/venues/:venue_name', checkAuth, (req, res) => {

  const { venue_name } = req.params;
  database("venues").where(database.raw('lower("venue_name")'), venue_name.toLowerCase()).select()
    .then((resp) => {
      if (!resp.length) {
        res.status(404).send({ error: 'Invalid Venue Name' });
      } else {
        database('venues').where('id', resp[0].id).del()
        .then(() => {
          res.status(204).send({
            success: `venue has been deleted`
          })
        })
        .catch((error) => {
          res.status(500).send({ error });
        });
      }
  });
});


app.patch('/api/v1/venues', checkAuth, (req, res) => {
  let newVenue = req.body;

  const expectedReq = ["venue_name", "city_name", "state_name"];
  const isMissing = expectedReq.every(param => req.body[param]);

  if (!isMissing) {
    return response.status(422).send({ error: 'Missing information from post request body, your request must contain a venue_name, city_name and stat_name to be processed' });
  }

  database("venues").where(database.raw('lower("venue_name")'), newVenue.venue_name.toLowerCase()).select()
  .then((data) => {
    if (!data.length) {
      res.status(404).send({ error: 'Invalid Venue Name' });
    } else {
      if(newVenue.city_name !== data[0].city_name){
        database("cities").where(database.raw('lower("city_name")'), newVenue.city_name.toLowerCase()).select()
        .then(stateRes => {
          if(!stateRes.length){
            database("cities").insert({
              state: newVenue.state_name,
              city_name: newVenue.city_name
            }, 'id')
            .then((res) => {
              console.log(res, data[0]);
              database("venues").where('venue_name', data[0].venue_name)
              .update({
                // venue_name: newVenue.venue_name,
                venue_URL: newVenue.venue_URL,
                venue_booking: newVenue.venue_booking,
                venue_phone: newVenue.venue_phone,
                venue_booking_contact: newVenue.venue_booking_contact,
                venue_PA_status: newVenue.venue_PA_status,
                venue_comments: newVenue.venue_comments,
                city_id: res[0]
              })
            })
            .then(() => {
              res.status(201).send({
                success: `${newVenue.venue_name}, in ${newVenue.city_name}, ${newVenue.state_name} has been added`
              })
            }).catch((error) => {
              res.status(500)
            });
          }
        })
      } else {
        console.log(data[0])
        database("venues").where('venue_name', data[0].venue_name)
        .update({
          id: data[0].id,
          venue_name: newVenue.venue_name,
          venue_URL: newVenue.venue_URL,
          venue_booking: newVenue.venue_booking,
          venue_phone: newVenue.venue_phone,
          venue_booking_contact: newVenue.venue_booking_contact,
          venue_PA_status: newVenue.venue_PA_status,
          venue_comments: newVenue.venue_comments,
        }, 'id')
        .then((id) => {
          console.log(id);
          res.status(201).send({
            success: `${newVenue.venue_name}, in ${newVenue.city_name}, ${newVenue.state_name} has been added`
          })
        }).catch((error) => {
          res.status(500)
        });
      }
    }
  })
})


app.listen(app.get('port'), () => {  //GET request is sent to this root/location and defining the response sent
  console.log(`${app.locals.title} is running on ${app.get('port')}.`) //logging what port the app is running at with the name - 'app.locals.title'...logged in terminal
});

module.exports = app
