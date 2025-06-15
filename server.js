const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// In-memory storage
let users = [];
let tasks = [];
let currentUserId = 1;
let currentTaskId = 1;

// Middleware for authentication simulation
function authenticate(req, res, next) {
  const { userId } = req.headers;
  const user = users.find(u => u.id === Number(userId));
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  req.user = user;
  next();
}

// Sign up
app.post('/signup', (req, res) => {
  const { name } = req.body;
  const newUser = { id: currentUserId++, name };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Login simulation (no password for demo)
app.post('/login', (req, res) => {
  const { name } = req.body;
  const user = users.find(u => u.name === name);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'Login successful', userId: user.id });
});

// Create Task
app.post('/tasks', authenticate, (req, res) => {
  const { title, description, deadline, assigneeId, category } = req.body;
  const newTask = {
    id: currentTaskId++,
    title,
    description,
    deadline,
    assigneeId,
    category,
    status: 'in-progress',
    createdBy: req.user.id
  };
  tasks.push(newTask);
  res.status(201).json({ message: 'Task created', task: newTask });
});

// View My Tasks
app.get('/tasks', authenticate, (req, res) => {
  const userTasks = tasks.filter(t => t.assigneeId === req.user.id);
  res.json(userTasks);
});

// Update Task Status
app.patch('/tasks/:id/status', authenticate, (req, res) => {
  const task = tasks.find(t => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  task.status = req.body.status;
  res.json({ message: 'Status updated', task });
});

// Simulated Notifications
function checkNotifications() {
  const now = new Date();
  tasks.forEach(task => {
    const deadline = new Date(task.deadline);
    const diff = deadline - now;
    if (diff < 86400000 && task.status !== 'complete') {
      console.log(`🔔 Notify user ${task.assigneeId} — Task "${task.title}" is due soon!`);
    }
  });
}
setInterval(checkNotifications, 60000); // check every minute

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
