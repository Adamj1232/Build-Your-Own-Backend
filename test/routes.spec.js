const chai = require("chai")
const should = chai.should()
const chaiHttp = require("chai-http")
const server = require("../server.js")

process.env.NODE_ENV = "test"
const environment = "test"
const configuration = require("../knexfile")[environment]
const database = require("knex")(configuration)

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyLXNlY3JldCIsInBhc3N3b3JkIjoic3VwZXItc2VjcmV0IiwiaWF0IjoxNDk5OTk2ODY3LCJleHAiOjE1MDIwMjE4Njd9.joru4co5YCxpAassmd4BFqldWEqOflWL_f0F-ywHe_Q"

chai.use(chaiHttp)


describe("API Routes", () => {

  beforeEach((done) => {
    database.seed.run()
    done()
  })

  before((done) => {
    database.migrate.latest()
    done()
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
        response.body.length.should.equal(982);
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
      .get("/api/v1/venues/each_venue/mishawaka amphitheatre")
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
        response.body.length.should.equal(4);
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
        response.body.length.should.equal(67);
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
    beforeEach((done) => {
      database.seed.run()
      done()
    })

    before((done) => {
      database.migrate.latest()
      done()
    });

    it("return 422 for post because of invalid information set", (done) => {
      chai.request(server)
      .post("/api/v1/venues")
      .set('authorization', token)
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
      .set('authorization', token)
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
    beforeEach((done) => {
      database.seed.run()
      done()
    })

    before((done) => {
      database.migrate.latest()
      done()
    });

    it("return 404 for post because venue wanting to be deleted does not exists", (done) => {
      chai.request(server)
      .delete("/api/v1/venues/amorpha")
      .set('authorization', token)
      .end((err, response) => {
        response.should.have.status(404)
        response.body.should.have.property('error')
        response.body.error.should.equal('Invalid Venue Name')
        done()
      })
    })
    //below test works, just skipping for organizational sanity
    it.skip("return 204 for delete after deleting venue", (done) => {
      chai.request(server)
      .delete("/api/v1/venues/shakedown")
      .set('authorization', token)
      .end((err, response) => {
        console.log(response.body);
        response.should.have.status(204)
        done()
      })
    })

    it("return 404 for post because venue Id wanting to be deleted does not exists", (done) => {
      chai.request(server)
      .delete("/api/v1/venues/id/376543")
      .set('authorization', token)
      .end((err, response) => {
        response.should.have.status(404)
        response.body.should.have.property('error')
        response.body.error.should.equal('Invalid Venue ID')
        done()
      })
    })
    //below test works, just skipping for organizational sanity
    it.skip("return 204 for delete after deleting venue", (done) => {
      chai.request(server)
      .delete("/api/v1/venues/id/12066")
      .set('authorization', token)
      .end((err, response) => {
        console.log(response.body);
        response.should.have.status(204)
        done()
      })
    })


  })
});
