const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

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
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, SECRET_JWT, (error, user) => {
    if (error) {
      console.log("THERE WAS AN ERROR")
      console.log(error)
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
        expiresIn: "7d",
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

app.post("/context", async (req, res) => {
  const { context } = req.body;
  const associated_org_id = '021b58be-2084-4f08-b860-f0e8481a7a8f';

  try {
    dbConnect(process.env.GEN_AUTH);

    const new_context = new Context({
      text: context,
      associated_org_id,
    });

    await new_context.save();

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

app.get('/context', async (req, res) => {
  try {
    dbConnect(process.env.GEN_AUTH);

    const context_docs = await Context.find({ associated_org_id: '021b58be-2084-4f08-b860-f0e8481a7a8f' });

    res.status(200).json({
      count: context_docs.length,
      contextDocs: context_docs
    })
  } catch (error) {
    res.status(500).json({
      message: "Error fetching context results"
    })
  }
});

app.post('/ask', async (req, res) => {
  const { question } = req.body;

  dbConnect(process.env.GEN_AUTH);

  const context_docs = await Context.find({ associated_org_id: '021b58be-2084-4f08-b860-f0e8481a7a8f' });
  const context_arr = context_docs.map((doc) => doc.text);
  console.log(context_arr)
  const context_str = context_arr.join("-CONTEXT");

  const openai = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });
  try {
    console.log("Running assistant...");
    const run = await openai.beta.threads.createAndRun({
      assistant_id: process.env.OPEN_AI_ASK_ASSISTANT,
      thread: {
        messages: [{ role: "user", content: `${context_str} -QUESTION- ${question} -QUESTION-` }],
      },
    });
    console.log("Fetching messages...");

    const checkRunStatus = async () => {
      while (true) {
        const updatedRun = await openai.beta.threads.runs.retrieve(
          run.thread_id,
          run.id
        );

        if (updatedRun.status === "completed") {
          console.log("OpenAI run completed successfully!");
          let assistantResponse = {};
          const messages = await openai.beta.threads.messages.list(
            run.thread_id
          );
          for (const message of messages.data.reverse()) {
            if (message.role === "assistant") {
              assistantResponse = message.content[0].text.value
            }
          }
    
          if (assistantResponse) {
            console.log("ASSISTANT'S RESPONSE FOUND", assistantResponse)
            res.status(200).json({response: assistantResponse})
          } else {
            console.log("No assistant response found in the messages.");
          }
          break;
        } else if (updatedRun.status !== "queued" || updatedRun.status !== "in_progress") {
          console.log("Waiting for run to complete...");
          console.log("CURRENT STATUS", updatedRun.status)
          console.log(Date.now())
          await new Promise((resolve) => setTimeout(resolve, 5000));
        } else {
          console.log(`OpenAI run failed with status: ${updatedRun.status}`);
          res.status(500).json({response: 'assistantResponse'})
          break;
        } 
      }
    };

    checkRunStatus();
  } catch (err) {
    console.error("Error during API interaction:", err);
    res.status(500).json({response: 'assistantResponse'})
  }
})

app.post('/refactor', async (req, res) => {
  const { code } = req.body;

  dbConnect(process.env.GEN_AUTH);

  const context_docs = await Context.find({ associated_org_id: '021b58be-2084-4f08-b860-f0e8481a7a8f' });
  const context_arr = context_docs.map((doc) => doc.text);
  console.log(context_arr)
  const context_str = context_arr.join("-CONTEXT");

  const openai = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });
  try {
    console.log("Running assistant...");
    const run = await openai.beta.threads.createAndRun({
      assistant_id: process.env.OPEN_AI_CODE_ASSISTANT,
      thread: {
        messages: [{ role: "user", content: `${context_str} -CODE- ${code} -CODE-` }],
      },
    });
    console.log("Fetching messages...");

    const checkRunStatus = async () => {
      while (true) {
        const updatedRun = await openai.beta.threads.runs.retrieve(
          run.thread_id,
          run.id
        );

        if (updatedRun.status === "completed") {
          console.log("OpenAI run completed successfully!");
          let assistantResponse = {};
          const messages = await openai.beta.threads.messages.list(
            run.thread_id
          );
          for (const message of messages.data.reverse()) {
            if (message.role === "assistant") {
              assistantResponse = message.content[0].text.value
            }
          }
    
          if (assistantResponse) {
            console.log("ASSISTANT'S RESPONSE FOUND", assistantResponse)
            res.status(200).json({response: assistantResponse})
          } else {
            console.log("No assistant response found in the messages.");
          }
          break;
        } else if (updatedRun.status !== "queued" || updatedRun.status !== "in_progress") {
          console.log("Waiting for run to complete...");
          console.log("CURRENT STATUS", updatedRun.status)
          console.log(Date.now())
          await new Promise((resolve) => setTimeout(resolve, 5000));
        } else {
          console.log(`OpenAI run failed with status: ${updatedRun.status}`);
          res.status(500).json({response: 'assistantResponse'})
          break;
        } 
      }
    };

    checkRunStatus();
  } catch (err) {
    console.error("Error during API interaction:", err);
    res.status(500).json({response: 'assistantResponse'})
  }
})

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
            expiresIn: "7d",
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
