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

    // const passwordIsValid = await user.comparePassword(password);
    const hashedPassword = await bcrypt.hash(password, salt);
    const passwordIsValid = await bcrypt.compare(hashedPassword, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const tokenPayload = {
      email: user.email,
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
  const { email, password } = req.body;

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

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email: email,
      password: hashedPassword,
      uuid: uuidv4(),
      is_verified: moment().format("YYYY-MM-DD HH:mm:ss"),
      is_active: false,
    });

    await RoleUser.create({ userId: newUser.id, roleId: 1});

    const tokenPayload = {
      email: newUser.email,
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
    const { email, favourite_book, favourite_pet, password } = req.body;
    
    try {
      const user = await User.findOne({
        where: {
          email,
          favourite_book,
          favourite_pet
        },
      });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      } else if (user.googleId) {
        return res.status(200).json({
          message: 'Access denied, user logged in with another authentication method',
        });
      } else {
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;
        await user.save();
  
        res.json({ status: true, message: 'Password updated successfully' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  router.post('/user/:id', async (req, res) => {
    const userId = req.params.id;
    const { hotel_name,userName,email, favoriteBook, favoritePet, phoneNo } = req.body;
  
    try {
      const user = await User.findByPk(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update the user's information
      user.hotel_name = hotel_name;
      user.userName = userName;
      user.email = email;
      user.phoneNo = phoneNo;
      user.favoriteBook = favoriteBook;
      user.favoritePet = favoritePet;
      user.is_active = 1;
  
      // Save the updated user to the database
      await user.save();
  
      res.json({ status: true, message: 'User updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  
  
module.exports = router;
