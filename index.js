require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./src/routes/auth");

const app = express();

app.use(express.json());
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("This API is running live🥳");
});
// console.log(process.env.DB_CONNECTION_STRING);

mongoose
  .connect(`${process.env.DB_CONNECTION_STRING}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch((err) => console.log(err));
