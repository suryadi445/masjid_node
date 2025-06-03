/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Kosongkan tabel terlebih dahulu
  await knex("roles").del();

  // Masukkan data role awal
  await knex("roles").insert([
    {
      id: 1,
      name: "Super Admin",
      description: "Super Admin",
    },
    {
      id: 2,
      name: "Admin",
      description: "Admin",
    },
    {
      id: 3,
      name: "User",
      description: "User",
    },
  ]);
};
