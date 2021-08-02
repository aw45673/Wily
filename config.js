import * as firebase from 'firebase'
require('@firebase/firestore')

var firebaseConfig = {
    apiKey: "AIzaSyC_Ic3AlUxQt3Zp1KUrqFMkBA9xCBLMqB4",
    authDomain: "wily-5d11d.firebaseapp.com",
    projectId: "wily-5d11d",
    storageBucket: "wily-5d11d.appspot.com",
    messagingSenderId: "267205981649",
    appId: "1:267205981649:web:72638edb84e7fbf93adcf0"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore()