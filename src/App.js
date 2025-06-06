import React, { useState, useEffect } from 'react';
import './App.css';
import { db } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const contexts = [
  'Leadership',
  'Ops Oversight',
  'Creative Work',
  'Communication',
  'Finance/Admin',
  'Sales & Clients',
  'Systems & Planning'
];

const App = () => {
  const [tasks, setTasks] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalContext, setModalContext] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      const snapshot = await getDocs(collection(db, "tasks"));
      const fetchedTasks = {};
      snapshot.forEach(doc => {
        const task = doc.data();
        const context = task.context;
        if (!fetchedTasks[context]) fetchedTasks[context] = [];
        fetchedTasks[context].push(task);
      });
      setTasks(fetchedTasks);
    };
    fetchTasks();
  }, []);

  const addTask = (context) => {
    const task = {
      description: '',
      notes: '',
      deadline: '',
      eventDate: '',
      time: '',
      location: '',
      attachment: ''
    };
    setSelectedTask(task);
    setModalContext(context);
  };

  const saveTask = async () => {
    const taskToSave = {
      ...selectedTask,
      context: modalContext,
      timestamp: new Date()
    };

    await addDoc(collection(db, "tasks"), taskToSave);

    setTasks(prev => ({
      ...prev,
      [modalContext]: [...(prev[modalContext] || []), selectedTask]
    }));
    setSelectedTask(null);
    setModalContext(null);
  };

  const handleChange = (field, value) => {
    setSelectedTask(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="App">
      <h1>The Grid</h1>
      <div className="grid">
        {contexts.map(context => (
          <div key={context} className="column">
            <h2>{context}</h2>
            <ul>
              {(tasks[context] || []).map((task, idx) => (
                <li key={idx}>{task.description || <em>Untitled Task</em>}</li>
              ))}
            </ul>
            <button onClick={() => addTask(context)}>+ Add Task</button>
          </div>
        ))}
      </div>

      {selectedTask && (
        <div className="modal">
          <div className="modal-content">
            <h3>New Task in {modalContext}</h3>
            <input
              type="text"
              placeholder="Task description"
              value={selectedTask.description}
              onChange={e => handleChange('description', e.target.value)}
            />
            <textarea
              placeholder="Notes"
              value={selectedTask.notes}
              onChange={e => handleChange('notes', e.target.value)}
            />
            <label>
              Deadline:
              <input
                type="date"
                value={selectedTask.deadline}
                onChange={e => handleChange('deadline', e.target.value)}
              />
            </label>
            <label>
              Event Date:
              <input
                type="date"
                value={selectedTask.eventDate}
                onChange={e => handleChange('eventDate', e.target.value)}
              />
            </label>
            <label>
              Time:
              <input
                type="time"
                value={selectedTask.time}
                onChange={e => handleChange('time', e.target.value)}
              />
            </label>
            <input
              type="text"
              placeholder="Location"
              value={selectedTask.location}
              onChange={e => handleChange('location', e.target.value)}
            />
            <input
              type="file"
              onChange={e => handleChange('attachment', e.target.files[0]?.name)}
            />
            <div className="modal-actions">
              <button onClick={saveTask}>Save Task</button>
              <button onClick={() => setSelectedTask(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
