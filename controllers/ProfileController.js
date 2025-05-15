const { updateProfileById } = require("../models/profileModel.js");

const updateProfile = async (req, res) => {
  try {
    const update = await updateProfileById({
      id: req.user.id,
      birthday: req.body.birthday,
      gender: req.body.gender,
      phone_number: req.body.phone_number,
      title: req.body.title,
      religion: req.body.religion,
      marital_status: req.body.marital_status,
      address: req.body.address,
      biography: req.body.biography,
      updated_by: req.user.id,
    });
    return res.success(200, update);
  } catch (error) {
    console.log(error);
    return res.error(500, error.message);
  }
};

module.exports = { updateProfile };
