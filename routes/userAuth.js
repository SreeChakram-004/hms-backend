const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const passport = require("passport");
const { User, Role, RoleUser } = require('../models');

const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const { jwtSecret } = require("../config/auth");
const salt = bcrypt.genSaltSync(10);

const validator = require("email-validator");


const router = express.Router();

const verifyUser = require("../middlewares/verifyUser");


// Login endpoint
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ where: { email }});

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     } else if (user.googleId) {
//       return res.status(200).json({
//         message: "Access denied, user logged in with another authentication method",
//       });
//     }

//     // const passwordIsValid = await user.comparePassword(password);
//     const hashedPassword = await bcrypt.hash(password, salt);
//     const passwordIsValid = await bcrypt.compare(hashedPassword, user.password);

//     if (!passwordIsValid) {
//       return res.status(401).json({ message: "Invalid password" });
//     }

//     const tokenPayload = {
//       email: user.email,
//       password: password
//       // Add any additional data you want to include in the token
//     };

//     const accessToken = jwt.sign(tokenPayload, jwtSecret, { expiresIn: "7d" });
//     const refreshToken = jwt.sign(tokenPayload, jwtSecret, { expiresIn: "7d" });

//     res.json({
//       status: true,
//       data: {
//         token_type: "Bearer",
//         expires_in: "7d",
//         access_token: accessToken,
//         refresh_token: refreshToken,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// });

// Login endpoint
// Login endpoint
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email }});

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else if (user.googleId) {
      return res.status(200).json({
        message: "Access denied, user logged in with another authentication method",
      });
    }

    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const tokenPayload = {
      email: user.email,
      password: password
      // Add any additional data you want to include in the token
    };

    const accessToken = jwt.sign(tokenPayload, jwtSecret, { expiresIn: "7d" });
    const refreshToken = jwt.sign(tokenPayload, jwtSecret, { expiresIn: "7d" });

    res.json({
      status: true,
      data: {
        token_type: "Bearer",
        expires_in: "7d",
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});



// Signup endpoint
router.post("/signup", async (req, res) => {
  const { hotel_name,email, password } = req.body;

  try {
    const validateEmail = validator.validate(email);
    console.log(validateEmail);
    
    if (!validateEmail) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      hotel_name: hotel_name,
      email: email,
      password: password,
      uuid: uuidv4(),
      is_verified: moment().format("YYYY-MM-DD HH:mm:ss"),
      is_active: false,
    });

    await RoleUser.create({ userId: newUser.id, roleId: 1});

    const tokenPayload = {
      email: newUser.email,
      password: password
      // Add any additional data you want to include in the token
    };

    const accessToken = jwt.sign(tokenPayload, jwtSecret, { expiresIn: "7d" });
    const refreshToken = jwt.sign(tokenPayload, jwtSecret, { expiresIn: "7d" });

    res.json({
      status: true,
      data: {
        token_type: "Bearer",
        expires_in: "7d",
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});




router.post("/forgot-password", async (req, res) => {
  const { email, favourite_pet, favourite_book, password } = req.body;

  try {
    const user = await User.findOne({
      where: {
        email,
        favourite_pet,
        favourite_book,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else if (user.googleId) {
      return res.status(200).json({
        message: "Access denied, user logged in with another authentication method",
      });
    } else if (user) {
      user.password = password;
      await user.save();

      const tokenPayload = {
        email: user.email,
        password: password
        // Add any additional data you want to include in the token
      };

      const accessToken = jwt.sign(tokenPayload, jwtSecret, { expiresIn: "7d" });
      const refreshToken = jwt.sign(tokenPayload, jwtSecret, { expiresIn: "7d" });
  
      res.json({
        status: true,
        data: {
          token_type: "Bearer",
          expires_in: "7d",
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});




  router.post('/user/:id', verifyUser, async (req, res) => {
    const id = req.params.id;
    const { hotel_name,userName,email, favourite_book, favourite_pet, phoneNo } = req.body;
  
    try {
      const user = await User.findByPk(id);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update the user's information
      user.hotel_name = hotel_name;
      user.userName = userName;
      user.email = email;
      user.phoneNo = phoneNo;
      user.favourite_book = favourite_book;
      user.favourite_pet = favourite_pet;
      user.is_active = 1;
  
      // Save the updated user to the database
      await user.save();
  
      res.json({ status: true, message: 'User updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  router.get("/profile", verifyUser, async (req, res) => {
    try {
      // Access the user ID from the middleware
      const email = req.user.email;
  
      // Fetch the user's data
      const user = await User.findOne({
        where: { email },
        attributes: { exclude: ["password","favourite_pet","favorite_book"] },
        include: [{ model: Role, through: { attributes: [] } }],
      });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Access the roles from user.Roles
      const roles = user.Roles;
  
      res.json({ status: true, user});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  });
  
  
  

  
  
  
module.exports = router;
