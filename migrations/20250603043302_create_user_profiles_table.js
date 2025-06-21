/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable("user_profiles", function (table) {
            table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
            table.uuid("user_id").notNullable();
            table.date("birthday").nullable();
            table.string("gender", 10).nullable();
            table.string("phone_number", 20).nullable();
            table.string("title", 100).nullable();
            table.string("religion", 50).nullable();
            table.string("marital_status", 50).nullable();
            table.text("address").nullable();
            table.text("biography").nullable();
            table.uuid("updated_by").nullable();
            table.timestamp("created_at").defaultTo(knex.fn.now());
            table.timestamp("updated_at").defaultTo(knex.fn.now());

            table
                .foreign("user_id")
                .references("id")
                .inTable("users")
                .onDelete("CASCADE");
            table.foreign("updated_by").references("id").inTable("users");
        })
        .then(() =>
            knex.raw(`
        CREATE TRIGGER trigger_update_timestamp_profiles
        BEFORE UPDATE ON user_profiles
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
        .raw(
            "DROP TRIGGER IF EXISTS trigger_update_timestamp_profiles ON user_profiles"
        )
        .then(() => knex.schema.dropTable("user_profiles"));
};
