const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const User = require("./models/user");
const multer = require("multer");
const bodyparser = require("body-parser");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

const app = express();

mongoose
  .connect(
    "mongodb+srv://parv:12341234@task-manager.kwcw1do.mongodb.net/sessions"
  )
  .then((res) => console.log("DB CONNNECTED"))
  .catch((err) => console.log(err));

const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    res.redirect("/login");
  }
};

app.use(
  session({
    secret: "this is a secret",
    resave: false,
    saveUninitialized: false,
  })
);

const port = 3000;
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./uploads"));

app.get("/getAll", async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

app.get("/", (req, res) => {
  res.render("landingPage.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.body.username,
      password: req.body.password,
    });
    if (user) {
      req.session.isAuth = true;
      req.session.username = req.body.username;
      res.redirect("/dashboard");
    } else {
      res.send("user does not exist, please register");
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", upload.single("profilephoto"), async (req, res) => {
  try {
    const user = await User.find({ username: req.body.username });
    console.log(user);
    if (user.length == 0) {
      const newUser = {
        profilephoto: req.file.filename,
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
      };
      await User.create(newUser);
      res.redirect(`/login`);
    } else {
      res.send("user exists");
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/dashboard", isAuth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.session.username });
    res.render("dashboard.ejs", { user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

app.get("*", (req, res) => {
  res.send("Invalid Request");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
