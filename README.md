# Gesture Visualizer

This is a small web experiment I built to play around with hand tracking in the browser. It uses MediaPipe to detect your hands effectively in real-time and draws some effects on top of the video feed.

The main idea was to make something that feels responsive and fun to look at.

## Features

There are a few specific visual effects included:

*   **Hand Skeleton**: Highlights your hand structure with a glow effect.
*   **Math Particles**: When you move your index finger or thumb, little math symbols float out. I thought this looked cool, like you are calculating something in the air.
*   **Thumb Connection**: If you bring your two thumbs into the frame, a string will appear connecting them. It reacts when you pull your hands apart.
*   **Mirrored Display**: The video is flipped so it acts like a mirror, which makes it much easier to coordinate your movements.

## How to Run It

If you want to try this out on your own machine, you will need Node.js installed.

1.  Clone this repository to your computer.
2.  Open your terminal in the project folder.
3.  Run `npm install` to get the necessary packages.
4.  Run `npm run dev` to start the local server.
5.  Open the link it gives you (usually localhost:5173) in your browser.

Make sure to allow camera access when the browser asks, or it wont work.
