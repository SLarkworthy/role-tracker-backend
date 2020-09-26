const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
// input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
// User model
const User = require("../../models/User");

router.post("/signup", (req, res) => {
    // Form validation
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
  const { name, email, password } = req.body;
  User.findOne({ email }).then(user => {
      if (user) {
        return res.status(400).json({ email: "Email already exists" });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });
        // salt and hash password
        bcrypt.genSalt(8, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save()
              .then(user => {
                jwt.sign(
                  { id: user.id },
                  keys.jwtSecret,
                  { expiresIn: 172800},
                  (error, token) => {
                    if (error) throw error;
                    res.json({
                      token,
                      user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                      }
                    })
                  }
                )
                
                
            })
              .catch(err => console.log(err));
          })
        })
      }
    })
  });
  
  module.exports = router;