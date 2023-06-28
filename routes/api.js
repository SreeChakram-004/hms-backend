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



router.get("/userCount", async (req, res) => {
    try {
      const userscount = await User.count();
      res.json({
        status: true,
        usersCount,
      });
    } catch (err) {
      return res.status(500).send({
        status: false,
        message: err.message ? err.message : "Internal Server Error.",
      });
    }
  });

  router.get("/departmentCount", async (req, res) => {
    try {
      const departmentCount = await Department.count();
      res.json({
        status: true,
        departmentCount,
      });
    } catch (err) {
      return res.status(500).send({
        status: false,
        message: err.message ? err.message : "Internal Server Error.",
      });
    }
  });


module.exports = router;