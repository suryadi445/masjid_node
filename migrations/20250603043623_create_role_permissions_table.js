/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("role_permissions", function (table) {
    table.increments("id").primary();
    table.integer("role_id").notNullable();
    table.integer("permission_id").notNullable();

    table.unique(["role_id", "permission_id"]);

    table
      .foreign("role_id")
      .references("id")
      .inTable("roles")
      .onDelete("CASCADE");
    table
      .foreign("permission_id")
      .references("id")
      .inTable("permissions")
      .onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("role_permissions");
};
