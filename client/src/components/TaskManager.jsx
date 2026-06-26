import { useState, useEffect } from 'react';
import '../styles/TaskManager.css';

const API_URL = import.meta.env.VITE_API_URL;

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_URL}/todos`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (inputValue.trim() === '') {
      alert('Please enter a task description');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: inputValue,
          description: inputValue,
          completed: false,
        }),
      });

      const data = await res.json();

      setTasks([...tasks, data.todo]);
      setInputValue('');
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
      });

      setTasks(tasks.filter((task) => task.id !== id));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const toggleComplete = async (id) => {
    const task = tasks.find((task) => task.id === id);

    if (!task) return;

    try {
      const res = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      const data = await res.json();

      setTasks(
        tasks.map((task) =>
          task.id === id ? data.todo : task
        )
      );
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  return (
    <div className="task-manager-container">
      <div className="task-manager">
        <h1>📚 Student Task Tracker</h1>

        <div className="input-section">
          <input
            type="text"
            placeholder="Enter a new task..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="task-input"
          />
          <button onClick={addTask} className="add-btn">
            Add Task
          </button>
        </div>

        <div className="stats">
          <span>Total Tasks: {tasks.length}</span>
          <span>Completed: {tasks.filter((t) => t.completed).length}</span>
          <span>Pending: {tasks.filter((t) => !t.completed).length}</span>
        </div>

        <div className="tasks-section">
          {tasks.length === 0 ? (
            <p className="no-tasks">No tasks yet. Add one to get started! ✨</p>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className={`task-item ${task.completed ? 'completed' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task.id)}
                    className="task-checkbox"
                  />
                  <span className="task-description">
                    {task.description}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="delete-btn"
                  >
                    🗑️ Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskManager;
