import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { tasksAPI } from '../../utils/api';

const TaskSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .required('Title is required'),
  description: Yup.string()
    .max(300, 'Description must be less than 300 characters'),
  assigned_to: Yup.string()
    .max(50, 'Assigned to must be less than 50 characters'),
});

const TaskForm = ({ eventId, task, onTaskCreated, onTaskUpdated, onCancel }) => {
  const [error, setError] = useState('');
  const isEditing = !!task;

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const taskData = {
        ...values,
        event_id: eventId,
      };

      let response;
      if (isEditing) {
        response = await tasksAPI.updateTask(task.id, taskData);
        onTaskUpdated && onTaskUpdated(response.data);
      } else {
        response = await tasksAPI.createTask(eventId, taskData);
        onTaskCreated && onTaskCreated(response.data);
      }
      
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} task`);
    }
    setSubmitting(false);
  };

  const initialValues = task ? {
    title: task.title,
    description: task.description || '',
    assigned_to: task.assigned_to || '',
  } : {
    title: '',
    description: '',
    assigned_to: '',
  };

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <h3>{isEditing ? 'Edit Task' : 'Add New Task'}</h3>
      
      {error && (
        <div style={{ color: 'var(--danger)', marginBottom: '15px' }}>
          {error}
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={TaskSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="form-group">
              <label className="form-label">Title</label>
              <Field name="title" type="text" className="form-control" />
              <ErrorMessage name="title" component="div" className="form-error" />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <Field 
                name="description" 
                as="textarea" 
                rows="3" 
                className="form-control"
                placeholder="Task description..."
              />
              <ErrorMessage name="description" component="div" className="form-error" />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned To</label>
              <Field 
                name="assigned_to" 
                type="text" 
                className="form-control"
                placeholder="Username or name..."
              />
              <ErrorMessage name="assigned_to" component="div" className="form-error" />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (isEditing ? 'Update Task' : 'Create Task')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default TaskForm;
