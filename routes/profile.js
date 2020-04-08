const express = require("express");
const router = express.Router();
// const db = require("../config/database");
const Gig = require("../models/Gig");
const User = require("../models/User");
const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const Op = Sequelize.Op;

let data = [];

router.get('/logout',(req,res)=>{
    data=[];
    res.redirect('/profile/login');
})

router.get("/", (req, res) => {
  if (data["user_name"] == null) {
    res.redirect("/profile/login");
  } else {
    Gig.findAll({
      attributes: ["title", "budget", "technologies"],
      where: {
        uid: data["uid"],
      },
    })
      .then((gigs) => res.render("profile", { data, gigs }))
      .catch((err) => console.log(err));
  }
});
router.get("/login", (req, res) => {
  if (data["user_name"] != null) {
    res.redirect("/profile");
  } else {
    res.render("login");
  }
});
router.get("/register", (req, res) => {
  if (data["user_name"] != null) {
    res.redirect("/profile");
  } else {
    res.render("register");
  }
});
router.post("/register", (req, res) => {
  let { name, designation, email, password } = req.body;
  let errors = [];
  if (!name) {
    errors.push("Enter your name");
  }
  if (!designation) {
    errors.push("Enter your designation");
  }
  if (!email) {
    errors.push("Enter your email");
  }
  if (!password) {
    errors.push("Enter your password");
  }
  if (errors.length > 0) {
    res.render("register", { errors, name, designation, email });
  } else {
    try {
      User.findOne({
        attributes: ["id"],
        where: {
          email: email,
        },
      })
        .then(async (user) => {
          if (user == null) {
            // const hashedpass =await bcrypt.hash(password, 10);
            User.create({
              name,
              designation,
              email,
              //   password: hashedpass
              password,
            })
              .then(() => res.redirect("/profile/login"))
              .catch((err) => console.log("Error: " + err));
          } else {
            errors.push("User Already exist with this email");
            res.render("register", { errors, name, designation, email });
          }
        })
        .catch((err) => console.log(err));
    } catch (err) {
      console.log(err);
    }
  }
});

router.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let errors = [];
  if (!email) {
    errors.push("Enter your email");
  }
  if (!password) {
    errors.push("Enter your password");
  }
  if (errors.length > 0) {
    res.render("login", { errors, email });
  } else {
    try {
      //   const hashedpass = await bcrypt.compare(password, password);
      User.findOne({
        where: {
          [Op.and]: [{ email }, { password }],
        },
      })
        .then((user) => {
          if (user == null) {
            errors.push("Wrong Username and Password");
            res.render("login", { errors, email });
          } else {
            // res.json(user);
            data["uid"] = user.id;
            data["user_name"] = user.name;
            data["designation"] = user.designation;
            data["email"] = user.email;
            data["imgUrl"] = "/img/showcase.jpg";
            res.redirect("/profile");
          }
        })
        .catch((err) => console.log("Error: " + err));
    } catch (err) {
      console.log(err);
    }
  }
});

router.get("/update", (req, res) => {
  let { uid } = req.query;
  User.findOne({
    where: {
      id: uid,
    },
  })
    .then((user) => {
      let { id, name, email, designation } = user;
      res.render("register", { id, name, email, designation });
    })
    .catch((err) => console.log(err));
});

router.post("/update", (req, res) => {
  let { uid } = req.query;
  let { name, designation, email } = req.body;
  let errors = [];

  if (!name) {
    errors.push("Enter your name");
  }
  if (!designation) {
    errors.push("Enter your designation");
  }
  if (!email) {
    errors.push("Enter Your Current Email Address");
  }
  if (errors.length > 0) {
    res.render("register", { errors, name, designation, email });
  } else {
    try {
      User.findOne({
        attributes: ["id"],
        where: {
          [Op.and]: [{ email }, { id: uid }],
        },
      })
        .then(async (user) => {
          if (user == null) {
            let id = uid;
            errors.push("you can't change your email address");
            res.render("register", { errors, name, designation, email, id });
          } else {
            let { name, designation, email } = req.body;
            const today = new Date();
            const date =
              today.getFullYear() +
              "-" +
              (today.getMonth() + 1) +
              "-" +
              today.getDate();

            User.update(
              {
                name,
                designation,
                updatedAt: date,
              },
              {
                where: {
                  id: uid,
                  email,
                },
              }
            )
              .then((update) => {
                if (update > 0) {
                  data["user_name"] = name;
                  data["designation"] = designation;
                  res.redirect("/profile");
                } else {
                  errType = "Unsucceess";
                  errDetails =
                    "Sorry! Server Problem while Updating Your profile, Try after a day.";
                  res.render("error", { errType, errDetails });
                }
              })
              .catch((err) => console.log(err));
          }
        })
        .catch((err) => console.log(err));
    } catch (err) {
      console.log(err);
    }
  }
});

router.get("/remove", (req, res) => {
  const { uid } = req.query;
  User.destroy({
    where: {
      id: uid
    }
  })
    .then(user => {
      if (user>0) {
        data=[];
        res.redirect("/profile/login");
      } else {
        let errType = "Unsucceess";
        let errDetails = "Some Problem While Deleting Your Account!, Try After a Day.";
        res.render("error", { errType, errDetails });
      }
    })
    .catch(err => console.log(err));
});
module.exports = router;
