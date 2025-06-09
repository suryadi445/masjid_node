/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Hapus data lama dulu
  await knex("menus").del();

  // Insert data menu
  await knex("menus").insert([
    {
      id: 1,
      name: "Dashboard",
      icon: "FaLaptopHouse",
      route: "/dashboard",
      parent_id: null,
      sort_order: 1,
      is_active: true,
    },
    {
      id: 2,
      name: "Users",
      icon: "FaUsers",
      route: "/users",
      parent_id: null,
      sort_order: 2,
      is_active: true,
    },
    {
      id: 3,
      name: "Roles",
      icon: "FaShieldAlt",
      route: "/roles",
      parent_id: null,
      sort_order: 3,
      is_active: true,
    },
    {
      id: 4,
      name: "Permissions",
      icon: "FaKey",
      route: "/permissions",
      parent_id: null,
      sort_order: 4,
      is_active: true,
    },
    {
      id: 5,
      name: "Settings",
      icon: "FaCog",
      route: "/settings",
      parent_id: null,
      sort_order: 5,
      is_active: true,
    },
    {
      id: 6,
      name: "Menus",
      icon: "FaListUl",
      route: "/menus",
      parent_id: null,
      sort_order: 6,
      is_active: true,
    },
  ]);
};
