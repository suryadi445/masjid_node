exports.seed = async function (knex) {
    await knex("user_roles").del(); // Kosongkan dulu

    // Ambil semua users dan roles
    const users = await knex("users").select("id", "email");
    const roles = await knex("roles").select("id", "name");

    const roleMap = {};
    roles.forEach((role) => {
        roleMap[role.name.toLowerCase()] = role.id;
    });

    const data = [];

    users.forEach((user) => {
        const email = user.email.toLowerCase();

        if (email.includes("suryadi") && roleMap["super admin"]) {
            data.push({ user_id: user.id, role_id: roleMap["super admin"] });
        } else if (email.includes("admin") && roleMap["admin"]) {
            data.push({ user_id: user.id, role_id: roleMap["admin"] });
        } else if (roleMap["user"]) {
            data.push({ user_id: user.id, role_id: roleMap["user"] });
        }
    });

    if (data.length > 0) {
        await knex("user_roles").insert(data);
        console.log(`✔ Inserted ${data.length} user_roles`);
    } else {
        console.warn("⚠ Tidak ada user_roles yang bisa dimasukkan.");
    }
};
