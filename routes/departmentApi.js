const express = require("express");

const {
  User,
  Role,
  RoleUser,
  Department,
  DepartmentUser,
} = require("../models");

const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
// const { jwtSecret } = require("../config/auth");
const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);

const validator = require("email-validator");

const router = express.Router();

const verifyUser = require("../middlewares/verifyUser");

const { Op } = require("sequelize");

//user
router.post("/create", verifyUser, async (req, res) => {
  const { name } = req.body;

  try {
    // Check if the logged-in user has the necessary access rights
    const userEmail = req.user.email;
    const user = await User.findOne({
      where: { email: userEmail },
      attributes: { exclude: ["password", "favourite_pet", "favorite_book"] },
      include: [{ model: Role, through: { attributes: [] } }],
    });

    if (
      user.dataValues.Roles[0].dataValues.id === 1 ||
      user.dataValues.Roles[0].dataValues.id === 2
    ) {
      const existingDepartment = await Department.findOne({ where: { name } });

      if (existingDepartment) {
        return res.status(409).json({ message: "Department already exists" });
      }

      const newDepartment = await Department.create({
        name: name,
        created_by_id: user.id,
      });

      const newDepartmentUser = await DepartmentUser.create({
        userId: user.dataValues.id,
        departmentId: newDepartment.id,
      });

      res.json({
        status: true,
        department: newDepartment,
      });
    } else {
      return res.status(501).json({ message: "Invalid Access" });
    }
  } catch (err) {
    if (err.details) {
      return res
        .status(400)
        .send({ status: false, message: err.details[0].message });
    } else {
      return res.status(500).send({
        status: false,
        message: err.message ? err.message : "Internal Server Error.",
      });
    }
  }
});

router.get("/all", verifyUser, async (req, res) => {
  try {
    // Check if the logged-in user has the necessary access rights
    const userEmail = req.user.email;
    const user = await User.findOne({
      where: { email: userEmail },
      attributes: { exclude: ["password", "favourite_pet", "favorite_book"] },
      include: [{ model: Role, through: { attributes: [] } }],
    });

    const { departmentName, page, limit } = req.query;

    const departmentOptions = {
      include: [
        {
          model: User,
          // through: {
            attributes: {
              exclude: ["password", "favourite_pet", "favorite_book","DepartmentUser"], // Specify the fields to exclude
            },
          // },
          where: { hotel_name: { [Op.eq]: user.hotel_name } },
        },
      ],
      order: [["createdAt", "DESC"]],
    };

    const totalCount = await Department.count(departmentOptions);

    // Pagination
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || totalCount;
    const totalPages = Math.ceil(totalCount / pageSize);
    const offset = (pageNumber - 1) * pageSize;

    departmentOptions.offset = offset;
    departmentOptions.limit = pageSize;

    const departments = await Department.findAll(departmentOptions);

    res.json({
      status: true,
      departments,
      totalCount,
      totalPages,
      currentPage: pageNumber,
    });
  } catch (err) {
    if (err.details) {
      return res
        .status(400)
        .send({ status: false, message: err.details[0].message });
    } else {
      return res.status(500).send({
        status: false,
        message: err.message ? err.message : "Internal Server Error.",
      });
    }
  }
});

router.get("/filter", verifyUser, async (req, res) => {
  try {
    // Fetch all department names
    const departments = await Department.findAll({
      attributes: ["name"], // Include only the 'name' attribute
    });

    res.json({
      status: true,
      departments,
    });
  } catch (err) {
    if (err.details) {
      return res
        .status(400)
        .send({ status: false, message: err.details[0].message });
    } else {
      return res.status(500).send({
        status: false,
        message: err.message ? err.message : "Internal Server Error.",
      });
    }
  }
});

router.post("/update/:departmentId", verifyUser, async (req, res) => {
  const { departmentId } = req.params;
  const { name } = req.body;

  try {
    // Check if the logged-in user has the necessary access rights
    const userEmail = req.user.email;
    const user = await User.findOne({
      where: { email: userEmail },
      attributes: { exclude: ["password", "favourite_pet", "favorite_book"] },
      include: [{ model: Role, through: { attributes: [] } }],
    });

    if (
      user.dataValues.Roles[0].dataValues.id === 1 ||
      user.dataValues.Roles[0].dataValues.id === 2
    ) {
      const department = await Department.findByPk(departmentId);

      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }

      const updatedDepartment = await department.update({
        name,
        updated_by_id: user.id,
      });

      res.json({
        status: true,
        department: updatedDepartment,
      });
    } else {
      return res.status(501).json({ message: "Invalid Access" });
    }
  } catch (err) {
    if (err.details) {
      return res
        .status(400)
        .send({ status: false, message: err.details[0].message });
    } else {
      return res.status(500).send({
        status: false,
        message: err.message ? err.message : "Internal Server Error.",
      });
    }
  }
});

router.post("/delete/:departmentId", verifyUser, async (req, res) => {
  const { departmentId } = req.params;

  try {
    // Check if the logged-in user has the necessary access rights
    const userEmail = req.user.email;
    const user = await User.findOne({
      where: { email: userEmail },
      attributes: { exclude: ["password", "favourite_pet", "favorite_book"] },
      include: [{ model: Role, through: { attributes: [] } }],
    });

    if (user.dataValues.Roles[0].dataValues.id === 1 || user.dataValues.Roles[0].dataValues.id === 2) {
      const department = await Department.findByPk(departmentId);

      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }

      await DepartmentUser.destroy({ where: { departmentId: department.id } });
      await department.destroy();

      res.json({
        status: true,
        message: "Record deleted successfully",
      });
    } else {
      return res.status(501).json({ message: "Invalid Access" });
    }
  } catch (err) {
    if (err.details) {
      return res
        .status(400)
        .send({ status: false, message: err.details[0].message });
    } else {
      return res.status(500).send({
        status: false,
        message: err.message ? err.message : "Internal Server Error.",
      });
    }
  }
});

module.exports = router;
