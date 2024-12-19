import React, { useEffect } from 'react';
import { messaging, getToken, onMessage } from './firebase';

const PushNotification = () => {
  useEffect(() => {
    // Request permission for notifications
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');

          // Get FCM token
          const token = await getToken(messaging, { vapidKey: 'BPY3g53DDCagFPDd5jkssc98uBd3TSCcw2C4kjghQ6OohBhfr197OG_Op1w4e0_Q6mxS0ppl3Hs2Eo3Fm2ymKIA' });
          console.log('FCM Token:', token);
        } else {
          console.log('Notification permission denied.');
        }
      } catch (error) {
        console.error('Error getting notification permission:', error);
      }
    };

    requestPermission();

    // Handle foreground messages
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground: ', payload);
      alert(`Notification: ${payload.notification.title} - ${payload.notification.body}`);
    });
  }, []);

  return (
    <div>
      <h2>Push Notifications</h2>
      <p>Make sure notifications are enabled for this browser.</p>
    </div>
  );
};

export default PushNotification;
