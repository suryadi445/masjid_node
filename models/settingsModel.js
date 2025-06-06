const pool = require("../config/db");

const SettingsModel = {
  async getSettingsAppsModel() {
    const result = await pool.query("SELECT * FROM settings LIMIT 1");
    const data = result.rows[0];

    if (typeof data?.social_media === "string") {
      try {
        data.social_media = JSON.parse(data.social_media);
      } catch (err) {
        data.social_media = [];
      }
    }

    return data;
  },

  async updateSettingsAppsModel(id, data) {
    if (Array.isArray(data.social_media)) {
      data.social_media = JSON.stringify(data.social_media);
    }

    if (id == null) {
      // insert new if id null
      const dataWithoutId = { ...data };
      delete dataWithoutId.id;

      const cleanedData = {};
      for (const [key, value] of Object.entries(dataWithoutId)) {
        if (key === "joined_date" && value === "") {
          cleanedData[key] = null;
        } else if (key === "social_media" && Array.isArray(value)) {
          cleanedData[key] = JSON.stringify(value);
        } else {
          cleanedData[key] = value;
        }
      }

      const keys = Object.keys(cleanedData);
      const values = Object.values(cleanedData);
      const columns = keys.join(", ");
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

      const insertQuery = `INSERT INTO settings (${columns}) VALUES (${placeholders}) RETURNING *`;
      const insertResult = await pool.query(insertQuery, values);

      return insertResult.rows[0];
    } else {
      // update if id not null
      const keys = Object.keys(data);
      const values = Object.values(data).map((val) =>
        val === "" ? null : val
      );

      const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
      const updateQuery = `UPDATE settings SET ${setClause} WHERE id = $${
        keys.length + 1
      } RETURNING *`;

      const updateResult = await pool.query(updateQuery, [...values, id]);
      return updateResult.rows[0];
    }
  },
};

module.exports = SettingsModel;
