/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    // Kosongkan tabel permissions
    await knex("permissions").del();

    // Tambahkan data CRUD permissions
    await knex("permissions").insert([
        {
            name: "create",
            description: "Create data",
        },
        {
            name: "read",
            description: "Read data",
        },
        {
            name: "update",
            description: "Update data",
        },
        {
            name: "delete",
            description: "Delete data",
        },
    ]);
};
