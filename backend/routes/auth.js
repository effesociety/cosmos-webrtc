const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const User = require("../model/schema");

const bodyParser = require('body-parser');

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:false}))

router.post(
  "/signup",
  [
    check("username", "Please Enter a Valid Username")
      .not()
      .isEmpty(),
    check("password", "Please enter a valid password").isLength({
      min: 4
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { username, password } = req.body;
    try {
      let user = await User.findOne({
        username
      });
      if (user) {
        return res.status(400).json({
          msg: "User Already Exists"
        });
      }

      user = new User({
        username,
        password,
        role: req.body.role || "user"
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id,
          username: username
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
          expiresIn: '24h'
        },
        (err, token) => {
          if (err) throw err;
          //res.cookie('token', token, { domain: 'localhost', path:'/', maxAge: 24 * 60 * 60 * 1000, httpOnly: true })
          res.cookie('token', token, { httpOnly: true })
          res.status(200).json({
            message: "Success"
          });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Error in Saving");
    }
  }
);

router.post(
  "/login",
  [
    check("username", "Please enter a valid username").not().isEmpty(),
    check("password", "Please enter a valid password").isLength({
      min: 4
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { username, password } = req.body;
    try {
      let user = await User.findOne({
        username
      });
      if (!user)
        return res.status(400).json({
          message: "User Not Exist"
        });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({
          message: "Incorrect Password !"
        });

      const payload = {
        user: {
          id: user.id,
          username: username
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
          expiresIn: '24h'
        },
        (err, token) => {
          if (err) throw err;
          //res.cookie('token', token, { domain: 'localhost', path:'/', maxAge: 24 * 60 * 60 * 1000, httpOnly: true })
          res.cookie('token', token, { httpOnly: true })
          res.status(200).json({
            message: "Success"
          });
        }
      );

    } catch (e) {
      console.error(e);
      res.status(500).json({
        message: "Server Error"
      });
    }
  }
);

router.delete(
  "/logout",
  (req, res) => {
	  res.clearCookie('token')
    res.status(200).json({
      message: "Success"
    })
  }
)

module.exports = router;
