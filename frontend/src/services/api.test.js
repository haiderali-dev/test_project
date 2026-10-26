import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchTasks, fetchTask, createTask, updateTask, patchTask, deleteTask } from "./api";

describe("API Service - Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const mockTask = {
    id: 1,
    title: "Test Task",
    description: "Test Description",
    status: "todo",
    priority: "medium",
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  };

  const mockResponse = { success: true, data: mockTask };

  describe("fetchTasks", () => {
    it("fetches tasks without filters", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [mockTask], count: 1 })
      });

      const tasks = await fetchTasks({});

      expect(global.fetch).toHaveBeenCalledWith("/api/tasks");
      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toEqual(mockTask);
    });

    it("fetches tasks with filters", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [mockTask], count: 1 })
      });

      const tasks = await fetchTasks({ status: "todo", priority: "high", sortBy: "title", sortOrder: "asc" });

      expect(global.fetch).toHaveBeenCalledWith("/api/tasks?status=todo&priority=high&sortBy=title&sortOrder=asc");
      expect(tasks).toHaveLength(1);
    });

    it("omits empty filter values", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [], count: 0 })
      });

      await fetchTasks({ status: "", priority: "high", sortBy: "createdAt", sortOrder: "desc" });

      expect(global.fetch).toHaveBeenCalledWith("/api/tasks?priority=high&sortBy=createdAt&sortOrder=desc");
    });

    it("throws error on failed response", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Server error" })
      });

      await expect(fetchTasks({})).rejects.toThrow("Server error");
    });
  });

  describe("fetchTask", () => {
    it("fetches single task by id", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const task = await fetchTask(1);

      expect(global.fetch).toHaveBeenCalledWith("/api/tasks/1");
      expect(task).toEqual(mockTask);
    });

    it("throws error on failed response", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Not found" })
      });

      await expect(fetchTask(999)).rejects.toThrow("Not found");
    });
  });

  describe("createTask", () => {
    it("creates new task with POST request", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const taskData = { title: "New Task", description: "Desc", status: "todo", priority: "medium" };
      const task = await createTask(taskData);

      expect(global.fetch).toHaveBeenCalledWith("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
      });
      expect(task).toEqual(mockTask);
    });
  });

  describe("updateTask", () => {
    it("updates task with PUT request", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const taskData = { title: "Updated Task", status: "done" };
      const task = await updateTask(1, taskData);

      expect(global.fetch).toHaveBeenCalledWith("/api/tasks/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
      });
      expect(task).toEqual(mockTask);
    });
  });

  describe("patchTask", () => {
    it("partially updates task with PATCH request", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const taskData = { status: "done" };
      const task = await patchTask(1, taskData);

      expect(global.fetch).toHaveBeenCalledWith("/api/tasks/1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
      });
      expect(task).toEqual(mockTask);
    });
  });

  describe("deleteTask", () => {
    it("deletes task with DELETE request", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: "Task deleted successfully" })
      });

      const result = await deleteTask(1);

      expect(global.fetch).toHaveBeenCalledWith("/api/tasks/1", { method: "DELETE" });
      expect(result).toEqual({ success: true, message: "Task deleted successfully" });
    });
  });

  describe("error handling", () => {
    it("includes status in error", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Not found" })
      });

      try {
        await fetchTask(999);
      } catch (error) {
        expect(error.status).toBe(404);
        expect(error.message).toBe("Not found");
      }
    });

    it("handles network errors", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(fetchTasks({})).rejects.toThrow("Network error");
    });
  });
});