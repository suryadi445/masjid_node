const pool = require("../config/db");

const updateProfileById = async (data) => {
    const {
        id,
        birthday,
        gender,
        phone_number,
        title,
        religion,
        marital_status,
        address,
        biography,
        updated_by,
    } = data;

    const fieldsToUpdate = [];
    const values = [];
    let index = 1;

    if (birthday) {
        fieldsToUpdate.push(`birthday = $${index++}`);
        values.push(birthday);
    }
    if (gender) {
        fieldsToUpdate.push(`gender = $${index++}`);
        values.push(gender);
    }
    if (phone_number) {
        fieldsToUpdate.push(`phone_number = $${index++}`);
        values.push(phone_number);
    }
    if (title) {
        fieldsToUpdate.push(`title = $${index++}`);
        values.push(title);
    }
    if (religion) {
        fieldsToUpdate.push(`religion = $${index++}`);
        values.push(religion);
    }
    if (marital_status) {
        fieldsToUpdate.push(`marital_status = $${index++}`);
        values.push(marital_status);
    }
    if (address) {
        fieldsToUpdate.push(`address = $${index++}`);
        values.push(address);
    }
    if (biography) {
        fieldsToUpdate.push(`biography = $${index++}`);
        values.push(biography);
    }

    fieldsToUpdate.push(`updated_at = NOW()`);
    fieldsToUpdate.push(`updated_by = $${index++}`);
    values.push(updated_by);

    // Tambahkan user_id untuk WHERE clause
    values.push(id);
    const query = `
    UPDATE user_profiles
    SET ${fieldsToUpdate.join(", ")}
    WHERE user_id = $${index}
    RETURNING id, birthday, gender, phone_number, title, religion, marital_status, address, biography
  `;

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};

module.exports = { updateProfileById };
