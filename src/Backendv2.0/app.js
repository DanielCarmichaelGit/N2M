const express = require("express");
const cors = require("cors");

// import utility functions
const dbConnect = require("./src/utils/dbConnect");

// import packages
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");
const bcrypt = require("bcrypt");

// Secret key for JWT signing (change it to a strong, random value)
const SECRET_JWT = process.env.SECRET_JWT;

// import models
const User = require("./models/user");

const app = express();
app.use(cors());
app.options("*", cors()); // Enable CORS pre-flight request for all routes
app.use(express.json({ limit: "50mb" }));

// create utility transporter for email service
const transporter = nodemailer.createTransport(
  sgTransport({
    auth: {
      api_key: process.env.SG_API_KEY,
    },
  })
);

function authenticateJWT(req, res, next) {
  console.log("Request!", req);
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, SECRET_JWT, (error, user) => {
    if (error) {
      return res.status(403).json({ message: "Token is invalid" });
    }

    req.user = user;
    next();
  });
}

async function comparePassword(plaintextPassword, hashedPassword) {
  return bcrypt.compare(plaintextPassword, hashedPassword);
}

// test endpoint to verify server status
app.get("/", (req, res) => {
  console.log("received home");
  return res.status(200).json({ message: "working" });
});

const saltRounds = 10;

app.post("/signup", async (req, res) => {
  try {
    const { type, email, password, name, source = "organic" } = req.body;
    dbConnect(process.env.GEN_AUTH);

    if (type) {
      const new_user = new User({
        type,
        user_id: uuidv4(),
        email,
        password: await bcrypt.hash(password, saltRounds),
        name: {
          first: name.first,
          last: name.last
        },
        marketable: true,
        marketing_source
      });
      if (type === "freelancer") {} else if (type === "client") {}
    }
  } catch (error) {
    res.status(500).json({
      message: "Backend Error",
      status: 500,
      error
    })
  }
})

app.post("/login", async (req, res) => {
  try {
    const { email, password, auth_type = "standard" } = req.body;

    if (auth_type === "standard") {
      if (email && password) {
        dbConnect(process.env.GEN_AUTH);
        const user = User.findOne({ email });

        if (user) {
          const hash_compare = await comparePassword(
            password,
            user.password
          );
          if (hash_compare) {
            console.log("hash compare true");
            const signed_user = jwt.sign(
              { user, userId: user.user_id },
              process.env.SECRET_JWT,
              {
                expiresIn: "7d",
              }
            );
    
            const result = {
              user,
              token: signed_user,
            };
    
            res.status(200).json(result);
          } else {
            console.log("hash compare false");
            res
              .status(400)
              .json({ message: "invalid email - password combination" });
          }
        }
      } else {
        res.status(404).json({
          message: "invalid email - password combination"
        })
      }
    }
  } catch (error) {
    res.status(500).json({
      message: "Issue Logging In",
      status: 500
    })
  }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));