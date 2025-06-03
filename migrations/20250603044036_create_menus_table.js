/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("menus", function (table) {
    table.increments("id").primary();
    table.string("name", 100).notNullable();
    table.string("icon", 100).nullable();
    table.string("route", 150).nullable();
    table.integer("parent_id").nullable();
    table.integer("sort_order").defaultTo(0).nullable();
    table.boolean("is_active").defaultTo(true).nullable();

    table
      .foreign("parent_id")
      .references("id")
      .inTable("menus")
      .onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("menus");
};
