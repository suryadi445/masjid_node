const path = process.env.FILE_UPLOAD_PATH || null;

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  return knex.schema
    .createTable("users", function (table) {
      table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
      table.string("name", 100).notNullable();
      table.string("email", 100).notNullable().unique();
      table.text("password").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.string("path", 255).nullable().defaultTo(path);
      table.string("image", 255).nullable();
      table.uuid("updated_by").nullable();

      table.foreign("updated_by").references("id").inTable("users");
    })
    .then(() =>
      knex.raw(`
        CREATE TRIGGER trigger_update_timestamp
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp();
      `)
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .raw("DROP TRIGGER IF EXISTS trigger_update_timestamp ON users")
    .then(() => knex.schema.dropTable("users"));
};
