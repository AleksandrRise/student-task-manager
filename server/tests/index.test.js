const request = require("supertest");
const app = require("../index");
const pool = require("../db");

jest.mock("../db", () => ({
  query: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

describe("Todos API", () => {
  describe("GET /todos", () => {
    it("returns all todos ordered by id", async () => {
      const todos = [
        { id: 1, title: "First", description: null, completed: false },
        { id: 2, title: "Second", description: "Test", completed: true },
      ];

      pool.query.mockResolvedValueOnce({ rows: todos });

      const res = await request(app).get("/todos");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(todos);
      expect(pool.query).toHaveBeenCalledWith(
        "SELECT * FROM todos ORDER BY id ASC"
      );
    });

    it("returns 500 when database query fails", async () => {
      pool.query.mockRejectedValueOnce(new Error("DB error"));

      const res = await request(app).get("/todos");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Failed to fetch todos" });
    });
  });

  describe("POST /todos", () => {
    it("creates a todo with title, description, and completed", async () => {
      const newTodo = {
        id: 1,
        title: "Learn tests",
        description: "Use Jest",
        completed: true,
      };

      pool.query.mockResolvedValueOnce({ rows: [newTodo] });

      const res = await request(app).post("/todos").send({
        title: "Learn tests",
        description: "Use Jest",
        completed: true,
      });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        message: "Todo created",
        todo: newTodo,
      });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO todos"),
        ["Learn tests", "Use Jest", true]
      );
    });

    it("defaults description to null and completed to false", async () => {
      const newTodo = {
        id: 1,
        title: "Default test",
        description: null,
        completed: false,
      };

      pool.query.mockResolvedValueOnce({ rows: [newTodo] });

      const res = await request(app).post("/todos").send({
        title: "Default test",
      });

      expect(res.status).toBe(201);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO todos"),
        ["Default test", null, false]
      );
    });

    it("returns 400 when title is missing", async () => {
      const res = await request(app).post("/todos").send({
        description: "Missing title",
      });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Title is required" });
      expect(pool.query).not.toHaveBeenCalled();
    });

    it("returns 500 when database insert fails", async () => {
      pool.query.mockRejectedValueOnce(new Error("DB error"));

      const res = await request(app).post("/todos").send({
        title: "Broken insert",
      });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Failed to create todo" });
    });
  });

  describe("DELETE /todos/:id", () => {
    it("deletes a todo by id", async () => {
      const deletedTodo = {
        id: 1,
        title: "Delete me",
        description: null,
        completed: false,
      };

      pool.query.mockResolvedValueOnce({ rows: [deletedTodo] });

      const res = await request(app).delete("/todos/1");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: "Todo with id 1 deleted",
        todo: deletedTodo,
      });

      expect(pool.query).toHaveBeenCalledWith(
        "DELETE FROM todos WHERE id = $1 RETURNING *",
        ["1"]
      );
    });

    it("returns 404 when todo does not exist", async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).delete("/todos/999");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Todo not found" });
    });

    it("returns 500 when database delete fails", async () => {
      pool.query.mockRejectedValueOnce(new Error("DB error"));

      const res = await request(app).delete("/todos/1");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Failed to delete todo" });
    });
  });

  describe("PATCH /todos/:id", () => {
    it("updates a todo completed status", async () => {
      const updatedTodo = {
        id: 1,
        title: "Updated",
        description: null,
        completed: true,
      };

      pool.query.mockResolvedValueOnce({ rows: [updatedTodo] });

      const res = await request(app).patch("/todos/1").send({
        completed: true,
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ todo: updatedTodo });

      expect(pool.query).toHaveBeenCalledWith(
        "UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *",
        [true, "1"]
      );
    });

    it("returns 404 when todo to update does not exist", async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).patch("/todos/999").send({
        completed: true,
      });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Todo not found" });
    });

    it("returns 500 when database update fails", async () => {
      pool.query.mockRejectedValueOnce(new Error("DB error"));

      const res = await request(app).patch("/todos/1").send({
        completed: true,
      });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Failed to update todo" });
    });
  });
});