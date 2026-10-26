import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TaskList from "./TaskList";
import TaskItem from "./TaskItem";

describe("TaskList - Unit Tests", () => {
  const mockTasks = [
    { id: 1, title: "Task 1", description: "", status: "todo", priority: "medium", createdAt: "2024-01-15T10:00:00.000Z", updatedAt: "2024-01-15T10:00:00.000Z" },
    { id: 2, title: "Task 2", description: "", status: "done", priority: "high", createdAt: "2024-01-16T10:00:00.000Z", updatedAt: "2024-01-16T10:00:00.000Z" }
  ];

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", () => {
    render(<TaskList tasks={[]} loading={true} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading tasks...")).toBeInTheDocument();
  });

  it("renders empty state when no tasks", () => {
    render(<TaskList tasks={[]} loading={false} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    expect(screen.getByText("No tasks found")).toBeInTheDocument();
    expect(screen.getByText("Try adjusting your filters or add a new task")).toBeInTheDocument();
  });

  it("renders list of tasks", () => {
    render(<TaskList tasks={mockTasks} loading={false} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
  });

  it("renders TaskItem components for each task", () => {
    render(<TaskList tasks={mockTasks} loading={false} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    const taskItems = screen.getAllByRole("listitem");
    expect(taskItems).toHaveLength(2);
  });

  it("passes correct props to TaskItem", () => {
    render(<TaskList tasks={mockTasks} loading={false} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    // TaskItem should be rendered with correct task data
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
  });

  it("does not render tasks when loading", () => {
    render(<TaskList tasks={mockTasks} loading={true} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
  });
});