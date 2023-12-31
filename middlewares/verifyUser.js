const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/auth");
const {User,Role} = require("../models");

const verifyUser = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Extract the user ID from the decoded token
  try {
    const decodedToken = jwt.verify(token, jwtSecret);
    const email = decodedToken.email;
    console.log(email);

    // Attach the user ID to the request object
    // req.email = email;

    const user = await User.findOne({
      where: { email },
      attributes: { exclude: ["password","favourite_pet","favorite_book"] },
    });

    console.log(user);

    req.user = user;

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = verifyUser;
