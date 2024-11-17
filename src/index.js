const bodyParser = require("body-parser");
const express = require("express");
const handlebars = require("express-handlebars").engine;

const firebaseAdmin = require("firebase-admin");

const serviceAccount = require("../service-account.json");
const cookieParser = require("cookie-parser");

const firebaseApp = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static("public"));

app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("views", "./src/views");
app.set("view engine", "handlebars");

app.get("/", async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    res.redirect("/login");
    return;
  }

  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);

    const groupsData = await firebaseAdmin
      .firestore()
      .collection(`users/${decodedToken.uid}/groups`)
      .get();

    const groups = [];

    for (const group of groupsData.docs) {
      const id = group.id;
      const tasks = await firebaseAdmin
        .firestore()
        .collection(`users/${decodedToken.uid}/groups/${id}/tasks`)
        .get();

      const data = {
        id: id,
        name: group.data().name,
        tasks: tasks.docs.map((task) => {
          return {
            id: task.id,
            name: task.data().name,
            description: task.data().description,
            completed: task.data().completed,
          };
        }),
      };
      groups.push(data);
    }
    console.log("Groups:", groups);
    res.render("home", {
      email: decodedToken.email,
      groups: groups,
    });
  } catch (error) {
    console.log(error);
    res.cookie("token", "", { maxAge: 0 });
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
