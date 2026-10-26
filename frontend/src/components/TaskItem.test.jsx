import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskItem from "./TaskItem";

describe("TaskItem - Unit Tests", () => {
  const mockTask = {
    id: 1,
    title: "Test Task",
    description: "Test Description",
    status: "in-progress",
    priority: "high",
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T12:00:00.000Z"
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders task title", () => {
    render(<TaskItem task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });

  it("renders task description", () => {
    render(<TaskItem task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("renders status badge", () => {
    render(<TaskItem task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText("in progress")).toBeInTheDocument();
  });

  it("renders priority badge", () => {
    render(<TaskItem task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText("high")).toBeInTheDocument();
  });

  it("renders formatted dates", () => {
    render(<TaskItem task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });

  it("calls onEdit when edit button clicked", async () => {
    const user = userEvent.setup();
    render(<TaskItem task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    await user.click(screen.getByRole("button", { name: /edit task: test task/i }));
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  it("calls onDelete with task id when delete button clicked", async () => {
    const user = userEvent.setup();
    render(<TaskItem task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    await user.click(screen.getByRole("button", { name: /delete task: test task/i }));
    
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it("does not render description when empty", () => {
    const taskWithoutDescription = { ...mockTask, description: "" };
    render(<TaskItem task={taskWithoutDescription} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    expect(screen.queryByText("Test Description")).not.toBeInTheDocument();
  });

  it("renders correct badge classes for different statuses", () => {
    const { rerender } = render(<TaskItem task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    // in-progress
    expect(screen.getByText("in progress")).toHaveClass("badge-in-progress");
    
    // todo
    rerender(<TaskItem task={{ ...mockTask, status: "todo" }} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText("todo")).toHaveClass("badge-todo");
    
    // done
    rerender(<TaskItem task={{ ...mockTask, status: "done" }} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText("done")).toHaveClass("badge-done");
  });

  it("renders correct badge classes for different priorities", () => {
    const { rerender } = render(<TaskItem task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    // high
    expect(screen.getByText("high")).toHaveClass("badge-high");
    
    // medium
    rerender(<TaskItem task={{ ...mockTask, priority: "medium" }} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText("medium")).toHaveClass("badge-medium");
    
    // low
    rerender(<TaskItem task={{ ...mockTask, priority: "low" }} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText("low")).toHaveClass("badge-low");
  });

  it("has correct aria labels on buttons", () => {
    render(<TaskItem task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    expect(screen.getByRole("button", { name: /edit task: test task/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete task: test task/i })).toBeInTheDocument();
  });
});