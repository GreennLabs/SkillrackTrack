importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyAX17tGH4g1UaokfMtzMv3SH33zpAbfeV4",
    authDomain: "skillrack-tracker.firebaseapp.com",
    projectId: "skillrack-tracker",
    storageBucket: "skillrack-tracker.firebasestorage.app",
    messagingSenderId: "42205378393",
    appId: "1:42205378393:web:c16cc4e17d52c1fcaa7e48",
    measurementId: "G-4YYWY1D43C"
  };


// Initialize Firebase app
firebase.initializeApp(firebaseConfig);

// Initialize messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
