const { updateProfileById } = require("../models/profileModel.js");

const updateProfile = async (req, res) => {
  try {
    const update = await updateProfileById({
      id: req.user.id,
      birthday: req.body.birthday,
      gender: req.body.gender,
      phone: req.body.phone,
      title: req.body.title,
    });
    return res.success(200, update);
  } catch (error) {
    console.log(error);
    return res.error(500, error.message);
  }
};

module.exports = { updateProfile };
