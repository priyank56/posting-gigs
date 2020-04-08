const express = require("express");
const router = express.Router();
// const db = require("../config/database");
const Gig = require("../models/Gig");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

//Get all gigs
router.get("/", (req, res) =>
  Gig.findAll()
    .then(gigs => res.render("gigs", { gigs }))
    .catch(err => console.log(err))
);
//form
router.get("/add", (req, res) => res.render("add"));

//Add Gig
router.post("/add", (req, res) => {
  let { title, technologies, budget, description, contact_email } = req.body;
  let errors = [];
  if (!title) {
    errors.push("enter a title");
  }
  if (!technologies) {
    errors.push("enter a technologies");
  }
  if (!description) {
    errors.push("enter a description");
  }
  if (!contact_email) {
    errors.push("enter a contact_email");
  }
  if (errors.length > 0) {
    res.render("add", {
      errors,
      title,
      technologies,
      budget,
      description,
      contact_email
    });
  } else {
    if (!budget) {
      budget = "It's free";
    } else {
      budget = `Rs.${budget}`;
    }
    technologies = technologies.toLowerCase().replace(/, /g, ",");
    title=title.toLowerCase();
    Gig.create({
      title,
      technologies,
      budget,
      description,
      contact_email
    })
      .then(() => res.redirect("/gigs"))
      .catch(err => console.log("Error: " + err));
  }
});

//search for gigs
router.get("/search", (req, res) => {
  let { term } = req.query;
  term = term.toString().toLowerCase();
  Gig.findAll({
    where: {
      [Op.or]: [
        { technologies: { [Op.like]: "%" + term + "%" } },
        { title: { [Op.like]: "%" + term + "%" } }
      ]
    }
  })
    .then(gigs => res.render("gigs", { gigs }))
    .catch(err => console.log(err));
});

router.get("/update", (req, res) => {
  const { gigid } = req.query;
  let id;
  let title = "";
  let technologies = "";
  let budget = "";
  let description = "";
  let contact_email = "";
  Gig.findAll({
    where: {
      id: gigid
    }
  })
    .then(gig => {
      id = gig[0].id;
      title = gig[0].title;
      technologies = gig[0].technologies;
      budget = parseInt(gig[0].budget.replace("Rs.", ""));
      description = gig[0].description;
      contact_email = gig[0].contact_email;
      res.render("add", {
        id,
        title,
        technologies,
        budget,
        description,
        contact_email
      });
    })
    .catch(err => console.log(err));
});

router.post("/update", (req, res) => {
  let {title,technologies,budget,description,contact_email} = req.body;
  const {gigid} =req.query;
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  let errType = "";
  let errDetails = "";
  console.log(gigid, title, technologies, budget, description, contact_email);
  if (!budget) {
    budget = "It's free";
  } else {
    budget = `Rs.${budget}`;
  }
  technologies = technologies.toLowerCase().replace(/, /g, ",");
  title=title.toLowerCase();
  Gig.update(
    {
      title,
      technologies,
      budget,
      description,
      contact_email,
      updatedAt: date
    },
    {
      where: {
        id: gigid
      }
    }
  )
    .then(update => {
      if (update > 0) {
        res.redirect("/gigs");
      } else {
        errType = "Unsucceess";
        errDetails = "Some Problem While Updating Gigs!, Try After a Day.";
        res.render("error", { errType, errDetails });
      }
    })
    .catch(err => console.log(err));
});

router.get("/delete", (req, res) => {
  const { gigid } = req.query;
  let errType = "";
  let errDetails = "";
  // let msg="";
  Gig.destroy({
    where: {
      id: gigid
    }
  })
    .then(gig => {
      if (gig > 0) {
        // msg='Gig Deleted Successfully!';
        res.redirect("/gigs");
      } else {
        errType = "Unsucceess";
        errDetails = "Some Problem While Deleting Gigs!, Try After a Day.";
        res.render("error", { errType, errDetails });
      }
    })
    .catch(err => console.log(err));
});
module.exports = router;
