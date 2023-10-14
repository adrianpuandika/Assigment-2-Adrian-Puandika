const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const app = express();
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("API Services");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    const dataUser = await fs.readFileSync("data/users.json", "utf8");
    const dataUserJSON = JSON.parse(dataUser);

    const cariUsername = dataUserJSON.find(
      (user) => user.username === username
    );

    if (!cariUsername) {
      res.status(400).json({
        status: false,
        message: "Username tidak ditemukan",
      });
      return;
    }

    if (password !== cariUsername.password) {
      res.status(400).json({
        status: false,
        message: "Maaf, password salah",
      });
      return;
    }

    const payload = {
      id: cariUsername.id,
      username: cariUsername.username,
    };

    const token = await jwt.sign(payload, "A2_AP", {
      expiresIn: 3600,
    });

    res.status(200).json({
      status: true,
      message: "Berhasil login",
      token: token,
    });
  } else {
    res.status(400).json({
      status: false,
      message: "Username dan password harus diisi",
    });
  }
});

app.get("/teachers", async (req, res) => {
  const headers = req.headers;

  if (!headers.authorization) {
    res.status(400).json({
      status: false,
      message: "Maaf, akses tanpa token tidak bisa.",
    });
    return;
  }

  if (headers.authorization.split(" ")[0] !== "Bearer") {
    res.status(400).json({
      status: false,
      message: "Maaf, akses tanpa token tidak bisa.",
    });
    return;
  }
  // 0      1
  // Bearer ejyxxxxx
  const token = headers.authorization.split(" ")[1];
  jwt.verify(token, "A2_AP", async (err, decoded) => {
    if (err) {
      res.status(400).json({
        status: false,
        message: "Token tidak valid",
      });
      return;
    }

    const dataTeachers = await fs.readFileSync("data/teachers.json", "utf8");
    const dataTeachersJSON = JSON.parse(dataTeachers);

    res.status(200).json({
      status: true,
      message: "Berhasil mendapatkan data",
      data: dataTeachersJSON,
    });
  });
});

app.listen(3000, () => {
  console.log("Server berjalan pada port 3000");
});
