const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get(`/`, async (req, res) => {
  try {

    const userList = await User.find().select("-passwordHash");

    if (!userList) {
      res.status(500).json({ success: false });
    }
    res.send(userList);
  }
  catch (error) {
    res.status(404).json({
      message: 'fail',
      error
    })
  }
});

router.get(`/:id`, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");

    if (!user) {
      res
        .status(500)
        .json({ success: false, message: "User for this id is not found" });
    }
    res.status(200).send(user);
  }
  catch (error) {
    res.status(404).json({
      message: 'fail',
      error
    })
  }
});

//SIGNUP
router.post(`/`, async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    color: req.body.color,
    passwordHash: bcryptjs.hashSync(req.body.password, 5),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.zip,
    country: req.body.zip,
  });

  user = await user.save();

  if (!user) {
    return res.status(404).send("the user can not be created");
  }
  res.send(user);
});

router.post("/register", async (req, res) => {
  try {
    User.find({ email: req.body.email })
      .exec()
      .then(user => {
        if (user.length >= 1) {
          return res.status(409).json({
            message: 'username is already exists'
          })
        }
        else {
          let user = new User({
            name: req.body.name,
            email: req.body.email,
            passwordHash: bcryptjs.hashSync(req.body.password, 5),
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
          });
          user = user.save().then(result => {
            res.status(200).json({
              message: 'user created successfully',
              result
            })
          })
            .catch(err => {
              res.status(500).json({
                error: err,
                message: 'fail'
              })
            })

          // if (!user) return res.status(400).send("the user cannot be created!");

          // res.send(user);
        }
      })

  }
  catch (error) {
    res.status(500).json({
      message: 'fail',
      error: error
    })
  }
});

//LOGIN
router.post(`/login`, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send("User not found");
    }
    if (user && bcryptjs.compareSync(req.body.password, user.passwordHash)) {
      const secret = process.env.secret;
      const token = jwt.sign(
        {
          userId: user.id,
          isAdmin: user.isAdmin,
        },
        secret,
        { expiresIn: "1d" }
      );
      return res.status(200).send({ user: user.email, token: token, id: user.id, isAdmin: user.isAdmin });
    } else {
      return res.status(404).send("Password incorrect");
    }
  }
  catch (error) {
    res.status(500).json({
      message: 'fail',
      error: err
    })
  }
});

router.get(`/get/count`, async (req, res) => {
  try {

    const userCount = await User.countDocuments((count) => count);

    if (!userCount) {
      res.status(500).json({ success: false });
    }
    res.send({
      userCount: userCount,
    });
  }
  catch (error) {
    res.json({
      message: 'fail',
      error
    })
  }
});

router.delete(`/:id`, async (req, res) => {
  try {

    User.findByIdAndRemove(req.params.id)
      .then((user) => {
        if (user) {
          return res.status(200).json({
            success: true,
            message: "user deleted successfully",
          });
        } else {
          return res
            .status(404)
            .json({ success: false, message: "user not found" });
        }
      })
      .catch((err) => {
        return res.status(400).json({ success: false, error: err });
      });
  }
  catch (error) {
    res.status(404).json({
      message: 'fail',
      error
    })
  }
});

module.exports = router;
