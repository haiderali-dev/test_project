import TaskItem from "./TaskItem";

function TaskList({ tasks, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="loading-container" role="status" aria-label="Loading tasks">
        <div className="spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks found</p>
        <p>Try adjusting your filters or add a new task</p>
      </div>
    );
  }

  return (
    <div className="task-list" role="list" aria-label="Task list">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default TaskList;