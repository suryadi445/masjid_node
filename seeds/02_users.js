const { v4: uuidv4 } = require("uuid");
const { hashPassword } = require("../helpers/hashPasswordHelper");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Kosongkan tabel terlebih dahulu
  await knex("users").del();

  // Hash password default
  const passwordHash = await hashPassword("11111111");

  // Masukkan data user awal
  await knex("users").insert([
    {
      // super admin
      id: uuidv4(),
      name: "Suryadi",
      email: "suryadi.hhb@gmail.com",
      password: passwordHash,
    },
    {
      // admin
      id: uuidv4(),
      name: "Admin",
      email: "admin@example.com",
      password: passwordHash,
    },
    {
      // user
      id: uuidv4(),
      name: "User",
      email: "user@example.com",
      password: passwordHash,
    },
  ]);
};
