function TaskItem({ task, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "todo": return "badge-todo";
      case "in-progress": return "badge-in-progress";
      case "done": return "badge-done";
      default: return "";
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "high": return "badge-high";
      case "medium": return "badge-medium";
      case "low": return "badge-low";
      default: return "";
    }
  };

  return (
    <article className="task-card" role="listitem">
      <div className="task-card-header">
        <h3 className="task-card-title">{task.title}</h3>
        <div className="task-card-badges">
          <span className={`badge ${getStatusBadgeClass(task.status)}`}>
            {task.status.replace("-", " ")}
          </span>
          <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
            {task.priority}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="task-card-description">{task.description}</p>
      )}

      <div className="task-card-meta">
        <span>Created: {formatDate(task.createdAt)}</span>
        <span>Updated: {formatDate(task.updatedAt)}</span>
      </div>

      <div className="task-card-actions">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onEdit(task)}
          aria-label={`Edit task: ${task.title}`}
        >
          Edit
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete task: ${task.title}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default TaskItem;