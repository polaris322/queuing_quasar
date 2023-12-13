//import firebase from 'firebase'
import firebase from 'firebase/app';
import { auth } from 'firebase/app';
//import 'firebase/auth';

import 'firebase/firestore'

//ADD YOUR CONFIG INFO HERE FROM FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBn3Db9GMcmisrTsU0ns3pf8r-q4oaX0kA",
  authDomain: "queuefirebase.firebaseapp.com",
  projectId: "queuefirebase",
  storageBucket: "queuefirebase.appspot.com",
  messagingSenderId: "84129795685",
  appId: "1:84129795685:web:220194e7012dcbde4b008c",
  measurementId: "G-4C4BERE6HE"
};

const firebaseApp = firebase.initializeApp(firebaseConfig)

const firestore = firebaseApp.firestore()

const settings = {}

firestore.settings(settings)

export default firestore

