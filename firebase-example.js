// firebase-example.js — optional sync example (uncomment and configure to enable)
/*
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js'
import { getDatabase, ref, set, onValue } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js'

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DB_URL",
  projectId: "YOUR_PROJECT_ID",
};

export function enableFirebaseSync(state, onRemoteUpdate){
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const key = 'lingua_spark_user_demo';
  // push local state
  set(ref(db, 'users/' + key), state);
  // listen for changes
  onValue(ref(db, 'users/' + key), (snapshot)=>{
    const val = snapshot.val(); if(val && onRemoteUpdate) onRemoteUpdate(val);
  });
}
*/
