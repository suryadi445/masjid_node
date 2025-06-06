/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("settings", function (table) {
    table.increments("id").primary();

    // Profile Apps
    table.string("apps_name");
    table.string("business_type");
    table.string("owner_name");
    table.string("established_year");
    table.string("business_license");
    table.string("tax_id");
    table.string("phone");
    table.string("email");
    table.string("operating_hours");
    table.text("address");
    table.json("social_media").defaultTo(JSON.stringify([]));

    // User Profile
    table.string("user_name");
    table.string("user_email");
    table.string("user_phone");
    table.string("user_role");
    table.string("role_periode");
    table.date("joined_date");

    // Timestamps
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("settings");
};
