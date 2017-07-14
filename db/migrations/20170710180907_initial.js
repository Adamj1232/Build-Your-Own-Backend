exports.up = (knex, Promise) => {
  return Promise.all([
    knex.schema.createTable('states', (table) => {
      table.increments('id').primary();
      table.string('state').unique();
      table.timestamps(true, true);
    }),

    knex.schema.createTable('cities', (table) => {
      table.increments('id').primary();
      table.string('city_name');
      table.string('state');
      table.integer('state_id').unsigned();
      table.foreign('state_id')
        .references('states.id');
      table.timestamps(true, true);
    }),

    knex.schema.createTable('venues', (table) => {
      table.increments('id').primary();
      table.string('venue_name');
      table.string('venue_URL');
      table.string('venue_booking');
      table.string('venue_phone');
      table.string('venue_booking_contact');
      table.string('venue_PA_status');
      table.string('venue_comments');
      table.integer('city_id').unsigned();
      table.foreign('city_id')
        .references('cities.id');
      table.timestamps(true, true);
    }),
  ]);
};

exports.down = (knex, Promise) => {
  return Promise.all([
    knex.schema.dropTable('venues'),
    knex.schema.dropTable('cities'),
    knex.schema.dropTable('states'),
  ]);
};
