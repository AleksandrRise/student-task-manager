import { useState } from 'react';
import '../styles/TaskManager.css';

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const addTask = () => {
    if (inputValue.trim() === '') {
      alert('Please enter a task description');
      return;
    }
    const newTask = {
      id: Date.now(),
      description: inputValue,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setInputValue('');
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const toggleComplete = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
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
                <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task.id)}
                    className="task-checkbox"
                  />
                  <span className="task-description">{task.description}</span>
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
