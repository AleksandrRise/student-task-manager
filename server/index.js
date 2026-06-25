const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/tasks", (req, res) => {
  res.json({ message: "Fetching tasks" });
});

app.post("/tasks", (req, res) => {
  const { title, description, completed } = req.body;
  res.json({ message: "Task created", task: { title, description, completed } });
});

app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  res.json({ message: `Task with id ${id} deleted` });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});