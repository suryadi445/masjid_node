const { findUserId, updateUser } = require("../models/userModel");
const path = require("path");
const fs = require("fs");
const formidable = require("formidable");

const users = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Doe" },
];

function getUsers(req, res) {
  res.writeHead(200);
  res.end(JSON.stringify(users));
}

function createUser(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    const userData = JSON.parse(body);
    users.push({ id: users.length + 1, name: userData.name });
    res.writeHead(201);
    res.end(
      JSON.stringify({ message: `User ${userData.name} created successfully` })
    );
  });
}

function getProfile(req, res) {
  const userId = req.user.id;

  findUserId(userId)
    .then((profile) => {
      if (!profile) return res.error(404, "User not found");

      const { password, created_at, updated_at, ...safeProfile } = profile;

      return res.success(200, safeProfile);
    })
    .catch((error) => {
      console.log(error);
      return res.error(500, error.message);
    });
}

function updateProfile(req, res) {
  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(__dirname, "../uploads/images");
  form.keepExtensions = true;

  // check and create directory if it doesn't exist
  if (!fs.existsSync(form.uploadDir)) {
    fs.mkdirSync(form.uploadDir, { recursive: true });
  }

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.log(err);
      return res.error(500, "Form parsing error");
    }

    const getField = (field) => (Array.isArray(field) ? field[0] : field);

    const id = getField(fields.id);
    const name = getField(fields.name);
    const email = getField(fields.email);
    const imageFile = files.image;

    // upload image
    let imageName = null;
    if (imageFile && imageFile[0]) {
      const fileExtension = path.extname(imageFile[0].originalFilename);
      const newFileName = `${Date.now()}${fileExtension}`;
      const newPath = path.join(form.uploadDir, newFileName);

      fs.renameSync(imageFile[0].filepath, newPath);

      imageName = newFileName;
    }

    try {
      // check old image
      const user = await findUserId(id);
      if (user?.image && imageName) {
        const oldImagePath = path.join(form.uploadDir, user.image);
        // remove old image
        if (fs.existsSync(oldImagePath)) {
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error("Failed remove old image", err);
            else console.log("Success remove old image.");
          });
        }
      }

      const update = await updateUser({
        data: {
          id: id,
          name: name,
          email: email,
          image: imageName || null,
          update_by: req.user?.id,
        },
      });

      return res.success(200, update);
    } catch (error) {
      console.log(error);
      return res.error(500, error.message);
    }
  });
}

module.exports = { getUsers, createUser, getProfile, updateProfile };
