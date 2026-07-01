const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "../.env" });

const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/todos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM todos ORDER BY id ASC");

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

app.post("/todos", async (req, res) => {
  try {
    const { title, description, completed } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const result = await pool.query(
      `INSERT INTO todos (title, description, completed)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, description || null, completed ?? false]
    );

    res.status(201).json({
      message: "Todo created",
      todo: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({
      message: `Todo with id ${id} deleted`,
      todo: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

app.patch("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const result = await pool.query(
      "UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *",
      [completed, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ todo: result.rows[0] });
  } catch (err) {
    console.error("PATCH /todos/:id error:", err);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

const PORT = process.env.PORT || 5000;

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}