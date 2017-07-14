const venueData = require('../test-data-set')

const reducedData = venueData.reduce( (newObj, venue) => {
  if(!newObj[venue.State]){
    newObj[venue.State] = {}
  }
  newObj[venue.State][venue.CITY] = []
  venueObj = {
      'name': venue.NAME,
      'url': venue.URL,
      'booking': venue.BOOKING,
      'venue_phone': venue.VENUE_PHONE,
      'venue_booking_contact': venue.CONTACT,
      'venue_PA_status': venue.PA,
      'venue_comments': venue.COMMENTS
    }
    newObj[venue.State][venue.CITY].push(venueObj)

  return newObj
}, {})


exports.seed = function(knex, Promise) {
  var stateKeys = Object.keys(reducedData)

  return knex('venues').del()
  .then(() => {
    return knex('cities').del();
  })
  .then(() => {
    return knex('states').del();
  })
  .then(() => {
    let statePromises = []
    stateKeys.forEach( state => {
      statePromises.push(createStates(knex, state))
    })
    return Promise.all(statePromises)
  })
  .then(() => {
    let cityPromises = [];
    stateKeys.forEach((state) => {
      let cityKeys = Object.keys(reducedData[state])
      cityKeys.forEach( city => {
        cityPromises.push(createCity(knex, city, state));
      })
    })
    return Promise.all(cityPromises);
  })
  .then(() => {
    let venuePromises = [];
    venueData.forEach((venue) => {
      venuePromises.push(createVenue(knex, venue.CITY, venue));
    })
    return Promise.all(venuePromises)
  });
};

const createStates = (knex, state) => {
  return knex('states').insert({ state: state })
};

const createCity = (knex, city, state) => {
  return knex('states').where('state', state).select('id')
  .then((cityState) => {
    return knex('cities').insert({
      city_name: city,
      state: state,
      state_id: cityState[0].id
    });
  });
};

const createVenue = (knex, city, venue) => {
  return knex('cities').where('city_name', city).select('id')
  .then((cityId) => {
    return knex('venues').insert({
      venue_name: venue.NAME,
      city_id: cityId[0].id,
      venue_URL: venue.URL,
      venue_booking: venue.BOOKING,
      venue_phone: venue.VENUE_PHONE,
      venue_booking_contact: venue.CONTACT,
      venue_PA_status: venue.PA,
      venue_comments: venue.COMMENTS
    });
  });
};
