/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("menu_roles", function (table) {
    table.increments("id").primary();
    table.integer("menu_id").notNullable();
    table.integer("role_id").notNullable();

    table.unique(["menu_id", "role_id"]);

    table
      .foreign("menu_id")
      .references("id")
      .inTable("menus")
      .onDelete("CASCADE");
    table
      .foreign("role_id")
      .references("id")
      .inTable("roles")
      .onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("menu_roles");
};
