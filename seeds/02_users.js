const { v4: uuidv4 } = require("uuid");
const { hashPassword } = require("../helpers/hashPasswordHelper");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    // Kosongkan tabel terlebih dahulu
    await knex("user_profiles").del();
    await knex("users").del();

    // Hash password default
    const passwordHash = await hashPassword("11111111");

    // Masukkan data user awal
    const users = [
        {
            id: uuidv4(),
            name: "Suryadi",
            email: "suryadi.hhb@gmail.com",
            password: passwordHash,
        },
        {
            id: uuidv4(),
            name: "Admin",
            email: "admin@example.com",
            password: passwordHash,
        },
        {
            id: uuidv4(),
            name: "User",
            email: "user@example.com",
            password: passwordHash,
        },
    ];

    // Insert ke users
    await knex("users").insert(users);

    // Insert ke user_profiles
    const userProfiles = users.map((user) => ({
        user_id: user.id,
        birthday: null,
        gender: null,
        phone_number: null,
        title: null,
        religion: null,
        marital_status: null,
        address: null,
        biography: null,
        created_at: new Date(),
        updated_at: new Date(),
    }));

    await knex("user_profiles").insert(userProfiles);
};
