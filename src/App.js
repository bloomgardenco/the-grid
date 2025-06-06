React, { useState, useEffect } from 'react';
import './App.css';
import { db } from './firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { gapi } from 'gapi-script';

const CONTEXTS = [
  'Leadership',
  'Ops Oversight',
  'Creative Work',
  'Communication',
  'Finance/Admin',
  'Sales & Clients',
  'Systems & Planning'
];

const CLIENT_ID = '86209280303-j4e9u5c606btp3mipq433p413ergq8kp.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCjJl8yCQFAFMh5OGyBCn-ZpnBpA6irNf4'; // 🔴 REPLACE WITH YOUR API KEY
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

function App() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    context: '',
    description: '',
    notes: '',
    deadline: '',
    eventDate: '',
    time: '',
    location: '',
    file: null
  });
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

 useEffect(() => {
  function start() {
    gapi.client.init({
      apiKey: AIzaSyCjJl8yCQFAFMh5OGyBCn-ZpnBpA6irNf4,
      clientId: 86209280303-j4e9u5c606btp3mipq433p413ergq8kp.apps.googleusercontent.com,
      scope: SCOPES,
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"]
.then(() => {
  const auth = gapi.auth2.getAuthInstance();
  auth.isSignedIn.listen(setIsSignedIn);
  setIsSignedIn(auth.isSignedIn.get());

  // ✅ Explicitly load calendar API
  gapi.client.load('calendar', 'v3').then(() => {
    console.log('✅ Calendar API loaded and authenticated');
  }).catch(err => {
    console.error('❌ Error loading Calendar API:', err);
  });
})
  }

  gapi.load('client:auth2', start);
}, []);
  const handleGoogleSignIn = () => {
    gapi.auth2.getAuthInstance().signIn();
  };

 const addToCalendar = (task) => {
  if (!gapi.client?.calendar) {
    console.error('❌ Google Calendar API is not loaded.');
    return;
  }

  const [hour, minute] = task.time.split(':');
  const eventStart = new Date(task.eventDate);
  eventStart.setHours(hour);
  eventStart.setMinutes(minute);
  const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000);

  const event = {
    summary: task.description,
    location: task.location,
    description: task.notes,
    start: {
      dateTime: eventStart.toISOString(),
      timeZone: 'America/New_York',
    },
    end: {
      dateTime: eventEnd.toISOString(),
      timeZone: 'America/New_York',
    },
  };

  gapi.client.calendar.events.insert({
    calendarId: 'bloomgardenco@gmail.com', // Your calendar ID
    resource: event,
  }).then(response => {
    console.log('✅ Event created:', response);
  }).catch(error => {
    console.error('❌ Calendar API error:', error);
  });
};

  const handleSave = async () => {
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...newTask,
      timestamp: new Date()
    });
    if (newTask.eventDate && newTask.time && isSignedIn) {
      addToCalendar(newTask);
    }
    setNewTask({
      context: '',
      description: '',
      notes: '',
      deadline: '',
      eventDate: '',
      time: '',
      location: '',
      file: null
    });
    setShowModal(false);
  };

  return (
    <div className="App">
      <h1>The Grid</h1>
      {!isSignedIn && <button onClick={handleGoogleSignIn}>Connect Google Calendar</button>}
      <div className="grid">
        {CONTEXTS.map(context => (
          <div key={context} className="column">
            <h2>{context}</h2>
            <button onClick={() => setShowModal(true)}>+ Add Task</button>
            {tasks.filter(t => t.context === context).map(task => (
              <div key={task.id} className="task">
                <strong>{task.description}</strong>
                <div>{task.notes}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {showModal && (
        <div className="modal">
          <h3>New Task</h3>
          <select value={newTask.context} onChange={e => setNewTask({ ...newTask, context: e.target.value })}>
            <option value="">Select Context</option>
            {CONTEXTS.map(context => (
              <option key={context} value={context}>{context}</option>
            ))}
          </select>
          <input placeholder="Task description" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
          <textarea placeholder="Notes" value={newTask.notes} onChange={e => setNewTask({ ...newTask, notes: e.target.value })}></textarea>
          <input type="date" value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })} />
          <input type="date" value={newTask.eventDate} onChange={e => setNewTask({ ...newTask, eventDate: e.target.value })} />
          <input type="time" value={newTask.time} onChange={e => setNewTask({ ...newTask, time: e.target.value })} />
          <input placeholder="Location" value={newTask.location} onChange={e => setNewTask({ ...newTask, location: e.target.value })} />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default App;
