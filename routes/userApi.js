const express = require("express");

const {
  User,
  Role,
  RoleUser,
  Department,
  DepartmentUsers,
} = require("../models");

const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
// const { jwtSecret } = require("../config/auth");
const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);

const validator = require("email-validator");
const { Op } = require("sequelize");

const router = express.Router();

const verifyUser = require("../middlewares/verifyUser");


//user
router.post("/create", verifyUser, async (req, res) => {
  const { email, password ,is_active } = req.body;
  try {
    const userEmail = req.user.email;
    const user = await User.findOne({
      where: { email: userEmail },
      attributes: { exclude: ["password", "favourite_pet", "favorite_book"] },
      include: [{ model: Role, through: { attributes: [] } }],
    });

    let assignedRoleId = req.body.roleId;
    if (user.dataValues.Roles[0].dataValues.id === 1) {
      assignedRoleId = 2 || 3;
    } else if (user.dataValues.Roles[0].dataValues.id === 2) {
      assignedRoleId = 3;
    } else {
      return res.status(501).json({ message: "Invalid Access" });
    }

    const validateEmail = validator.validate(email);
    console.log(validateEmail);

    if (!validateEmail) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const newUser = await User.create({
      hotel_name: user.hotel_name,
      email: email,
      is_active: is_active,
      password: password,
      uuid: uuidv4(),
      is_verified: moment().format("YYYY-MM-DD HH:mm:ss"),
      is_active: false,
    });

    let role = await RoleUser.create({
      userId: newUser.id,
      roleId: assignedRoleId,
    });

    res.json({
      status: true,
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/all", verifyUser, async (req, res) => {
  try {
    // Check if the logged-in user has the necessary access rights
    const { page, limit, search } = req.query;
    const email = req.user.email;

    // Fetch the user's data
    const user = await User.findOne({
      where: { email },
      attributes: { exclude: ["password", "favourite_pet", "favorite_book"] },
      include: [{ model: Role, through: { attributes: [] } }],
    });
    console.log(user, "efg");

    const userOptions = {
      include: [{ model: Role, through: { attributes: [] } }],
      where: { hotel_name: { [Op.regexp]: user.hotel_name } },
      order: [["createdAt", "DESC"]],
    };

    if (userOptions) {
      userOptions.where.hotel_name = {
        [Op.like]: user.hotel_name.replace(/\s/g, "\\ ") // Replace spaces with escaped spaces
      };
    }
    
    if (search) {
      userOptions.where.userName = { [Op.like]: `%${search}%` };
    }

    const totalCount = await User.count(userOptions);

    // Pagination
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || totalCount;
    const totalPages = Math.ceil(totalCount / pageSize);
    const offset = (pageNumber - 1) * pageSize;

    userOptions.offset = offset;
    userOptions.limit = pageSize;

    const users = await User.findAll(userOptions);

    res.json({
      status: true,
      users,
      totalCount,
      totalPages,
      currentPage: pageNumber,
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      message: err.message ? err.message : "Internal Server Error.",
    });
  }
});



router.post("/update/:userId", verifyUser, async (req, res) => {
  const { email, password, roleId ,userName ,phoneNo,is_active } = req.body;
  const { userId } = req.params;

  try {
    const userEmail = req.user.email;
    const user = await User.findOne({
      where: { email: userEmail },
      attributes: { exclude: ["password", "favourite_pet", "favorite_book"] },
      include: [{ model: Role, through: { attributes: [] } }],
    });

    let assignedRoleId = roleId;
    if (user.dataValues.Roles[0].dataValues.id === 1) {
      assignedRoleId = 2 || 3;
    } else if (user.dataValues.Roles[0].dataValues.id === 2) {
      assignedRoleId = 3;
    } else {
      return res.status(501).json({ message: "Invalid Access" });
    }

    const validateEmail = validator.validate(email);

    if (!validateEmail) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser && existingUser.id !== parseInt(userId)) {
      return res.status(409).json({ message: "Email already exists" });
    }

    let updatedUser = await User.update(
      {
        email: email,
        password: password,
        userName: userName,
        phoneNo: phoneNo,
        is_active: is_active
      },
      { where: { id: userId } }
    );

    let role = await RoleUser.update(
      { roleId: assignedRoleId },
      { where: { userId: userId } }
    );

    res.json({
      status: true,
      message: "Records updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/delete/:userId", verifyUser, async (req, res) => {
    const { userId } = req.params;
  
    try {
      const deletedUser = await User.destroy({ where: { id: userId } });
  
      // Check if any user was deleted
      if (deletedUser === 0) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Delete the user's role associations
      await RoleUser.destroy({ where: { userId: userId } });
  
      res.json({
        status: true,
        message: "Record deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
});
  



module.exports = router;
