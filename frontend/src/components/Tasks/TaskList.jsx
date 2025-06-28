import { useState } from 'react';
import { tasksAPI } from '../../utils/api';
import TaskForm from './TaskForm';

const TaskList = ({ tasks, onTaskUpdated, onTaskDeleted }) => {
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState('');

  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed };
      const response = await tasksAPI.updateTask(task.id, updatedTask);
      onTaskUpdated(response.data);
      setError('');
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksAPI.deleteTask(taskId);
        onTaskDeleted(taskId);
        setError('');
      } catch (err) {
        setError('Failed to delete task');
      }
    }
  };

  const handleEditComplete = (updatedTask) => {
    onTaskUpdated(updatedTask);
    setEditingTask(null);
  };

  const getStatusColor = (completed) => {
    return completed ? 'var(--success)' : 'var(--warning)';
  };

  if (tasks.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>No tasks yet</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div style={{ color: 'var(--danger)', marginBottom: '15px' }}>
          {error}
        </div>
      )}

      {editingTask && (
        <TaskForm
          eventId={editingTask.event_id}
          task={editingTask}
          onTaskUpdated={handleEditComplete}
          onCancel={() => setEditingTask(null)}
        />
      )}

      {tasks.map(task => (
        <div key={task.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleComplete(task)}
                  style={{ marginRight: '10px' }}
                />
                <h4 style={{ 
                  textDecoration: task.completed ? 'line-through' : 'none',
                  opacity: task.completed ? 0.7 : 1 
                }}>
                  {task.title}
                </h4>
                <span
                  style={{
                    marginLeft: '10px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: getStatusColor(task.completed),
                    color: 'white',
                  }}
                >
                  {task.completed ? 'Completed' : 'Pending'}
                </span>
              </div>
              
              {task.description && (
                <p style={{ 
                  marginBottom: '8px',
                  opacity: task.completed ? 0.7 : 1 
                }}>
                  {task.description}
                </p>
              )}
              
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {task.assigned_to && (
                  <span>Assigned to: <strong>{task.assigned_to}</strong> • </span>
                )}
                Created by {task.creator}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginLeft: '15px' }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => setEditingTask(task)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => handleDelete(task.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
