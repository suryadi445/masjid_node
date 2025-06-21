/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable("menu_permissions", function (table) {
            table.increments("id").primary();
            table.integer("menu_id").notNullable();
            table.integer("permission_id").notNullable();
            table.timestamp("created_at").defaultTo(knex.fn.now()).nullable();
            table.timestamp("updated_at").defaultTo(knex.fn.now()).nullable();

            table.unique(["menu_id", "permission_id"]);

            table
                .foreign("menu_id")
                .references("id")
                .inTable("menus")
                .onDelete("CASCADE");
            table
                .foreign("permission_id")
                .references("id")
                .inTable("permissions")
                .onDelete("CASCADE");
        })
        .then(() =>
            knex.raw(`
        CREATE TRIGGER trigger_update_menu_permissions_updated_at
        BEFORE UPDATE ON menu_permissions
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
        .raw(
            "DROP TRIGGER IF EXISTS trigger_update_menu_permissions_updated_at ON menu_permissions"
        )
        .then(() => knex.schema.dropTable("menu_permissions"));
};
