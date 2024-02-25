A pdf reader created using Javascript, CSS and Html to display PDFs that can be navigated using Hand Gestures and Gaze. 
We use [handsfree.js](https://handsfreejs.netlify.app/) , an open source javascript based hand and eye tracking library with configurable recognition tools inbuilt.
The user’s in-air gestures are mapped to the screen with two small
circular pointers, each corresponding to a hand. The pointer is small, translucent and gray to
ensure that users receive instant feedback while also not being distracting and affecting the
reading experience. To recognize swipes using hand gestures, we start recording a gesture when the user pinches their index finger and thumb together.
