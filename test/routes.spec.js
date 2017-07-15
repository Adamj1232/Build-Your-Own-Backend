const chai = require("chai")
const should = chai.should()
const chaiHttp = require("chai-http")
const server = require("../server.js")

process.env.NODE_ENV = "test"
const environment = "test"
const configuration = require("../knexfile")[environment]
const database = require("knex")(configuration)

chai.use(chaiHttp)


describe("API Routes", () => {

  beforeEach((done) => {
    database.seed.run().then(() => done())
  })

  before((done) => {
    database.migrate.latest().then(() => done())
  });


  describe("GET /api/v1/venues", () => {

    it("should return all venues in db", (done) => {
      chai.request(server)
      .get("/api/v1/venues/all")
      .end((err, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a("array");
        response.body[0].should.have.property("id");
        response.body[0].should.have.property("venue_URL");
        response.body[0].should.have.property("venue_booking");
        response.body[0].should.have.property("venue_phone");
        response.body[0].should.have.property("venue_booking_contact");
        response.body[0].should.have.property("venue_PA_status");
        response.body[0].should.have.property("venue_comments");
        done();
      });
    });

    it("should return a 404 for a sad path for all venues path", (done) => {
      chai.request(server)
      .get("/api/v1/venues/all/a")
      .end((err, response) => {
        response.should.have.status(404);
        done();
      });
    });

    it("should return all cities with venues in db", (done) => {
      chai.request(server)
      .get("/api/v1/venues/cities/all")
      .end((err, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a("array");
        response.body.length.should.equal(102);
        response.body[0].should.have.property("id");
        response.body[0].should.have.property("city_name");
        response.body[0].should.have.property("state");
        response.body[0].should.have.property("state_id");
        done();
      });
    });

    it("should return a 404 because of sad path for all venues within city", (done) => {
      chai.request(server)
      .get("/api/v1/venues/cities/all/bass")
      .end((err, response) => {
        response.should.have.status(404);
        done();
      });
    });

    it("should return the specific venue passed into the url", (done) => {
      chai.request(server)
      .get("/api/v1/venues/each_venue/Rock-A-Billies")
      .end((err, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a("array");
        response.body.length.should.equal(1);
        response.body[0].should.have.property("id");
        response.body[0].should.have.property("venue_URL");
        response.body[0].should.have.property("venue_booking");
        response.body[0].should.have.property("venue_phone");
        response.body[0].should.have.property("venue_booking_contact");
        response.body[0].should.have.property("venue_PA_status");
        response.body[0].should.have.property("venue_comments");
        done();
      });
    });

    it("should return a 404 because of sad path for specific venues", (done) => {
      chai.request(server)
      .get("/api/v1/venues/each_venue/mishawaka amphitheatress")
      .end((err, response) => {
        response.should.have.status(404);
        done();
      });
    });

    it("should return a 404 because of sad path for specific city venues", (done) => {
      chai.request(server)
      .get("/api/v1/venues/each_venue/amorpha")
      .end((err, response) => {
        response.should.have.status(404);
        done();
      });
    });


    it("should return all venues for a specific city in db", (done) => {
      chai.request(server)
      .get("/api/v1/venues/cities/name/arvada")
      .end((err, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a("array");
        response.body.length.should.equal(2);
        response.body[0].should.have.property("id");
        response.body[0].should.have.property("venue_URL");
        response.body[0].should.have.property("venue_booking");
        response.body[0].should.have.property("venue_phone");
        response.body[0].should.have.property("venue_booking_contact");
        response.body[0].should.have.property("venue_PA_status");
        response.body[0].should.have.property("venue_comments");
        done();
      });
    });

    //the next test passes and returns the proper data correctly but throws an error in the test suite
    it("should return all venues for a specific state in db", (done) => {
      chai.request(server)
      .get("/api/v1/venues/all/cities/all/CA")
      .end((err, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a("array");
        response.body.length.should.equal(2);
        response.body[1][0].should.have.property("id");
        response.body[1][0].should.have.property("venue_URL");
        response.body[1][0].should.have.property("venue_booking");
        response.body[1][0].should.have.property("venue_phone");
        response.body[1][0].should.have.property("venue_booking_contact");
        response.body[1][0].should.have.property("venue_PA_status");
        response.body[1][0].should.have.property("venue_comments");
        done();
      });
    });
  });


  describe("POST /api/v1/venues", () => {


    it("return 422 for post because of invalid information set", (done) => {
      chai.request(server)
      .post("/api/v1/venues")
      .set('authorization', process.env.TOKEN)
      .send({
        venue_name: "super sweet venue",
        city_name: "denver",
      })
      .end((err, response) => {
        response.should.have.status(422)
        done()
      })
    })

    it("return 422 for post because of invalid information set", (done) => {
      chai.request(server)
      .post("/api/v1/venues")
      .set('authorization', process.env.TOKEN)
      .send({
        venue_name: "super sweet venue",
        city_name: "denver",
        state_name: 'co'
      })
      .end((err, response) => {
        response.should.have.status(201)
        response.body.should.have.property('success')
        response.body.success.should.equal('super sweet venue, in denver, co has been added')
        done()
      })
    })
  })


  describe("DELETE /api/v1/venues", () => {

    before((done) => {
      database.migrate.latest().then(() => done())
    });

    beforeEach((done) => {
      database.seed.run().then(() => done())
    })


    it("return 404 for post because venue wanting to be deleted does not exists", (done) => {
      chai.request(server)
      .delete("/api/v1/venues/amorpha")
      .set('authorization', process.env.TOKEN)
      .end((err, response) => {
        response.should.have.status(404)
        response.body.should.have.property('error')
        response.body.error.should.equal('Invalid Venue Name')
        done()
      })
    })

    it("return 204 for delete after deleting venue", (done) => {
      chai.request(server)
      .delete("/api/v1/venues/aurora")
      .set('authorization', process.env.TOKEN)
      .end((err, response) => {
        console.log(response.body);
        response.should.have.status(204)
        done()
      })
    })

    it("return 404 for post because venue Id to be deleted does not exists", (done) => {
      chai.request(server)
      .delete("/api/v1/venues/id/376543")
      .set('authorization', process.env.TOKEN)
      .end((err, response) => {
        response.should.have.status(404)
        response.body.should.have.property('error')
        response.body.error.should.equal('Invalid Venue ID')
        done()
      })
    })

    it("return 204 for delete after deleting venue", (done) => {
      chai.request(server)
      .delete("/api/v1/venues/id/147136")
      .set('authorization', process.env.TOKEN)
      .end((err, response) => {
        console.log(response.body);
        response.should.have.status(204)
        done()
      })
    })


  })
});
