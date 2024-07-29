const express = require("express");
const cors = require("cors");

// import utility functions
const dbConnect = require("./src/utils/dbConnect");

// import packages
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Secret key for JWT signing (change it to a strong, random value)
const SECRET_JWT = process.env.SECRET_JWT;

// import models
const User = require("./src/models/user");
const Context = require("./src/models/context");

const app = express();
app.use(cors());
app.options("*", cors()); // Enable CORS pre-flight request for all routes
app.use(express.json({ limit: "50mb" }));
const saltRounds = 10;

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

//###########################################################################
// Add a POST endpoint for user registration (signup)
app.post("/signup", async (req, res) => {
  try {
    await dbConnect(process.env.GEN_AUTH);
    const { password, org_name } = req.body;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const new_user = new User({
      associated_org_id: uuidv4(),
      org_name,
      password: hashedPassword,
    });
    // save new user and the new group made for the user
    const created_user = await new_user.save();

    const token = jwt.sign(
      {
        user: created_user,
        user_id: created_user.user_id,
      },
      process.env.SECRET_JWT,
      {
        expiresIn: "30d",
      }
    );

    res.status(200).json({
      message: "user created",
      user: created_user,
      token,
    });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

app.post("/context", authenticateJWT, async (req, res) => {
  const { context } = req.body;
  const associated_org_id = req.user.associated_org_id;

  try {
    dbConnect(process.env.GEN_AUTH);

    const new_context = new Context({
      text: context,
      associated_org_id,
    });

    new_context.save();

    res.status(200).json({
      message: "Context created",
      context: new_context,
    });
  } catch (error) {
    res.status(500).json({
      message: "Issue creating context",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    dbConnect(process.env.GEN_AUTH);

    const { org_name, password } = req.body;

    const existing_user = await User.find({ org_name });

    if (Object.keys(existing_user[0]).length === 0) {
      res.status(500).json({ message: "User not found" });
      console.log("user not found");
    } else {
      const hash_compare = await comparePassword(
        password,
        existing_user[0].password
      );

      if (hash_compare) {
        const signed_user = jwt.sign(
          { user: existing_user[0], userId: existing_user[0].user_id },
          process.env.SECRET_JWT,
          {
            expiresIn: "30d",
          }
        );

        const result = {
          user: existing_user[0],
          token: signed_user,
        };

        res.status(200).json(result);
      } else {
        console.log("hash compare false");
        res
          .status(400)
          .json({ message: "User not authorized. Incorrect password" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
