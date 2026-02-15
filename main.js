import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { Visualizer } from './visualizer.js';

const video = document.getElementById('webcam');
const canvas = document.getElementById('output_canvas');
const visualizer = new Visualizer(canvas);

let handLandmarker = undefined;
let webcamRunning = false;
let lastVideoTime = -1;

async function createHandLandmarker() {
    const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
    );
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numHands: 2
    });
}

function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

function enableCam() {
    if (!handLandmarker) {
        console.log('Wait! HandLandmarker not loaded yet.');
        return;
    }

    if (webcamRunning === true) {
        webcamRunning = false;
        return;
    }

    const constraints = {
        video: true
    };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.addEventListener('loadeddata', predictWebcam);
        webcamRunning = true;
    });
}

async function predictWebcam() {
    // Canvas sizing is handled by the Visualizer class/window resize event


    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        const startTimeMs = performance.now();

        if (handLandmarker) {
            const results = handLandmarker.detectForVideo(video, startTimeMs);
            visualizer.update(results.landmarks);
        }
    }

    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}

// Initial setup
createHandLandmarker().then(() => {
    console.log('HandLandmarker created!');
    if (hasGetUserMedia()) {
        enableCam();
    } else {
        console.warn('getUserMedia() is not supported by your browser');
    }
});
