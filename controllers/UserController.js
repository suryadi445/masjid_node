const {
  allUser,
  findUserId,
  updateUserById,
  deleteProfileById,
} = require("../models/userModel");
const path = require("path");
const fs = require("fs");
const formidable = require("formidable");
const { validateFile, moveUploadedFile } = require("../utils/fileHandler");
const url = require("url");
const { hashPassword } = require("../helpers/hashPasswordHelper");

const getAllUser = async function (req, res) {
  const parsedUrl = url.parse(req.url, true);

  const page = parseInt(parsedUrl.query.page) || 1;
  const limit = parseInt(parsedUrl.query.limit) || 10;
  const search = parsedUrl.query.search || "";
  try {
    const users = await allUser(limit, page, search);
    res.success(200, users);
  } catch (error) {
    console.log(error);
    res.error(500, error.message);
  }
};

function createUser(req, res) {
  const userData = req.body;
  users.push({ id: users.length + 1, name: userData.name });
  res.writeHead(201);
  res.end(
    JSON.stringify({ message: `User ${userData.name} created successfully` })
  );
}

function getUser(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const queryUserId = parsedUrl.query.id;
  /**
   * Use the user ID from the query parameter if available; otherwise, use the ID from the authenticated user (token)
   */
  const userId = queryUserId ? queryUserId : req.user.id;

  findUserId(userId)
    .then((profile) => {
      if (!profile) return res.error(404, "User not found");

      const { password, created_at, updated_at, ...safeProfile } = profile;

      safeProfile.path = process.env.FILE_UPLOAD_PATH;

      return res.success(200, safeProfile);
    })
    .catch((error) => {
      console.log(error);
      return res.error(500, error.message);
    });
}

function updateUser(req, res) {
  const contentType = req.headers["content-type"] || "";

  if (contentType.includes("multipart/form-data")) {
    return updateUserByMultipartForm(req, res);
  } else {
    return updateUserByJson(req, res);
  }
}

function updateUserByMultipartForm(req, res) {
  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(__dirname, "../uploads/images");
  form.keepExtensions = true;

  // check and create directory if it doesn't exist
  if (!fs.existsSync(form.uploadDir)) {
    fs.mkdirSync(form.uploadDir, { recursive: true });
  }

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.log("error parse", err);
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
      const { valid, error } = validateFile(imageFile[0], "image");
      if (!valid) {
        return res.error(400, error);
      }

      // Move file if valid
      const result = moveUploadedFile(imageFile[0], form.uploadDir);
      if (!result) {
        return res.error(500, moveError);
      }

      imageName = result.newFileName;
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

      const update = await updateUserById({
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

async function updateUserByJson(req, res) {
  const { id, name, email, password } = req.body;

  try {
    let hashedPassword = null;
    if (password?.trim()) {
      hashedPassword = await hashPassword(password);
    }

    const update = await updateUserById({
      data: {
        id: id,
        name: name,
        email: email,
        password: hashedPassword,
        update_by: req.user?.id,
      },
    });
    return res.success(200, update);
  } catch (error) {
    console.log(error);
    return res.error(500, error.message);
  }
}

const deleteProfile = async (req, res) => {
  const id = req.body.id;

  if (!id) {
    return res.error(400, "User ID is required");
  }

  try {
    const deleteProfile = await deleteProfileById(id);
    return res.success(200, deleteProfile);
  } catch (error) {
    console.log(error);
    return res.error(500, error.message);
  }
};

module.exports = { getAllUser, createUser, getUser, updateUser, deleteProfile };
