const seedData = require('../seedData')

const reducedData = venueData.reduce( (newObj, venue) => {
  if(!newObj[venue.State]){
    newObj[venue.State] = []
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
  let stateKeys = Object.keys(seedData)

  return knex('venues').del()
  .then(() => {
    return knex('cities').del();
  })
  .then(() => {
    return knex('states').del();
  })
  .then(() => {
    stateKeys.forEach( state => {
      return knex('state').insert(state);
    })
  })
  .then(() => {
    let cityPromises = [];
    stateKeys.forEach((state) => {
      reducedData[state].forEach( city => {
        cityPromises.push(createCity(knex, city, state));
      })
      return Promise.all(cityPromises);
    });
  });

  .then(() => {
    let venuePromises = [];
    seedData.forEach((venue) => {
      venuePromises.push(createVenue(knex, venue.CITY));
    })
    return Promise.all(venuePromises)
  });
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

const createVenue = (knex, city) => {
  return knex('cities').where('city', city).select('id')
  .then((cityId) => {
    return knex('venues').insert({
      venue_name: venue.NAME,
      venue_city: venue.cityId,
      venue_state: venue.State,
      venue_URL: venue.URL,
      venue_booking: venue.BOOKING,
      venue_phone: venue.VENUE_PHONE,
      venue_booking_contact: venue.CONTACT,
      venue_PA_status: venue.PA,
      venue_comments: venue.COMMENTS
    });
  });
};

//
//
//
//
//
//
//
// exports.seed = function(knex, Promise) {
//
//   return knex('cities').del()
//   .then(() => knex('states').del())
//   .then(() => knex('venues').del())
//   .then(() => {
//     return Promise.all([
//       const stateKeys = Object.keys(reducedData)
//
//       stateKeys.map( state =>{
//         knex('states').insert({
//           name: state
//         }, 'id')
//         .then(stateName => {
//           reducedData[stateName].map( citiesPerState => {
//             knex('cities').insert([
//               { city: citiesPerState, state: stateName }
//               .then( cityWithVenues => {
//                 cityWithVenues.map( venue => {
//                   return knex('venues').insert({
//                     venue_name: venue.NAME,
//                     venue_city: venue.CITY,
//                     venue_state: venue.State,
//                     venue_URL: venue.URL,
//                     venue_booking: venue.BOOKING,
//                     venue_phone: venue.VENUE_PHONE,
//                     venue_booking_contact: venue.CONTACT,
//                     venue_PA_status: venue.PA,
//                     venue_comments: venue.COMMENTS
//                   });
//                 })
//               })
//             ])
//           })
//         })
//       })
//       .then(() => console.log('Seeding complete!'))
//       .catch(error => console.log(`Error seeding data: ${error}`));
//     ]) // end return Promise.all
//   })
//   .catch(error => console.log(`Error seeding data: ${error}`));
// };
//
//
//
// const stateData = (knex) => {
//   const stateArr =  seedData.map( venue => {
//     return venue.State
//   });
//
//   const states = stateArr.filter(( element, index, inputArray ) => {
//     return inputArray.indexOf(element) == index;
//   });
//
//   return states.map ( state => {
//     return knex('states').insert({
//       state: state
//     });
//   }, 'id');
// };
//
// const cityData = (knex) => {
//
//   const cityStateArr = venueData.reduce( ( newArr, venue ) => {
//     newArr.push(venue.CITY+ ', ' +venue.State)
//     return newArr;
//   }, []);
//
//   const uniqueCities = cityStateArr.filter(( element, index, inputArray ) => {
//     return inputArray.indexOf(element) == index
//   });
//
//
//   uniqueCities.forEach( city => {
//     let location = city.split(', ')
//     finalUniqueLocations.push(location)
//   })
//
//   return finalUniqueLocations.map( city => {
//     return knex('cities').insert({
//       city: city[0],
//       state: city[1]
//     });
//   });
// };
//
// exports.seed = (knex, Promise) => {
//   return knex('states').del()
//   .then(() => knex('cities').del())
//   .then(() => knex('venues').del())
//   .then(() => {
//     const states = stateData(knex);
//     const cities = cityData(knex);
//     // const venues = venueData(knex);
//     return Promise.all([...states, ...cities, ...venues]);
//   });
// };
//
//
//
//
//
// const importState = (knex, state, venueData) =>{
//   let venueCities = venueData[state].CITY;
//   return knex('states').insert({
//     state: state
//   }, 'id')
//   .then((state) =>{
//     let cityPromise = [];
//     venueCities.forEach((city)=>{
//       cityPromise.push(importCities(knex, city, state))
//     })
//     return Promise.all(cityPromise)
//     .then(() => console.log('Seeding Complete at Models Promise'))
//     .catch((error) => console.log(`Error seeding data at Models Promise: ${error}`))
//   })
// };
//
// const importCities = (knex, city, state) =>{
//   return knex('city').insert({
//     city_name: model.name,
//     make_id: make[0],
//   }, 'id')
//   .then((model) =>{
//     let yearsPromise = [];
//     years.forEach((year)=>{
//       yearsPromise.push(importYears(knex, year, model))
//     })
//     return Promise.all(yearsPromise)
//     .then(() => console.log('Seeding Complete at Years'))
//     .catch((error) => console.log(`Error seeding at Years Promise: ${error}`))
//   })
// };
//
// const importYears = (knex, year, model) =>{
//   let trims = year.trim
//   return knex('years').insert({
//     year: year.year,
//     model_id: model[0]
//   }, 'id')
//   .then((year) =>{
//     let trimsPromise = [];
//     trims.forEach((trim) =>{
//       trimsPromise.push(importTrims(knex, trim, year))
//     })
//     return Promise.all(trimsPromise)
//     .then(()=> console.log('Seeding Complete at Trims'))
//     .catch((error) => console.log(`Error seeding at Trims Promise: ${error}`))
//   })
// }
//
// const importTrims = (knex, trim, year) =>{
//   return knex('trims').insert({
//     year_id: year[0],
//     trim_id: trim.trim_id,
//     fuel_type: trim.fuel_type,
//     horsepower: trim.horsepower,
//     cylinders: trim.cylinders,
//     transmission: trim.transmission,
//     drive: trim.drive,
//     doors: trim.doors,
//     market: trim.market,
//     size: trim.size,
//     style: trim.style,
//     highway_mpg: trim.highway_mpg,
//     city_mpg: trim.city_mpg,
//     msrp: trim.msrp
//   })
// }
//
// exports.seed = (knex, Promise) => {
//   let carsData = helper.reduceMakes(carData);
//   let makesArray = Object.keys(carsData);
//   console.log(carsData)
//   return knex('models').del()
//   .then(() => knex('makes').del())
//   .then(() =>{
//     let makesPromise = [];
//     makesArray.forEach((make, i) =>{
//       makesPromise.push(importMakes(knex, make, carsData))
//     })
//     return Promise.all(makesPromise)
//     .then(() => console.log('Seeding Complete at Makes Promise'))
//     .catch((error) => console.log(`Error seeding data at makesPromise: ${error}`))
//   })
//   .catch( error => console.log(`Error seeding data: ${error}`))
// };
