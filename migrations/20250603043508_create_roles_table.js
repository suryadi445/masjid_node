/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("roles", function (table) {
      table.increments("id").primary();
      table.string("name", 50).notNullable().unique();
      table.text("description").nullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.uuid("created_by").nullable();
      table.uuid("updated_by").nullable();

      table.foreign("created_by").references("id").inTable("users");
      table.foreign("updated_by").references("id").inTable("users");
    })
    .then(() =>
      knex.raw(`
        CREATE TRIGGER trigger_update_updated_at
        BEFORE UPDATE ON roles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `)
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .raw("DROP TRIGGER IF EXISTS trigger_update_updated_at ON roles")
    .then(() => knex.schema.dropTable("roles"));
};
