import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraIcon, BackIcon, CheckIcon } from './icons';

interface WebcamCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreamActive, setIsStreamActive] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsStreamActive(false);
    }
  }, []);

  const handleStreamError = useCallback((err: unknown) => {
    console.error("Error accessing webcam:", err);
    let message = "Could not access the webcam. Please check your browser permissions.";
    if (err instanceof DOMException) {
      switch (err.name) {
        case 'NotAllowedError':
          message = "Webcam access was denied. Please grant permission in your browser settings and try again.";
          break;
        case 'NotFoundError':
          message = "No webcam found. Please ensure your camera is connected and enabled.";
          break;
        case 'NotReadableError':
          message = "The webcam is currently in use by another application or there was a hardware error.";
          break;
        case 'OverconstrainedError':
          message = "The webcam does not support the required resolutions.";
          break;
        default:
          message = `An unexpected error occurred while accessing the webcam: ${err.name}`;
      }
    }
    setError(message);
    setIsStreamActive(false);
  }, []);

  const startStream = useCallback(async () => {
    stopStream();
    setError(null);
    
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Webcam functionality is not supported by your browser. Please ensure you are on a secure (HTTPS) connection.");
      return;
    }

    let mediaStream: MediaStream;
    try {
      const constraints = { video: { width: 1280, height: 720, facingMode: 'user' as const } };
      mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'OverconstrainedError') {
        console.warn("Requested constraints not supported, trying default constraints.");
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (finalErr) {
          handleStreamError(finalErr);
          return;
        }
      } else {
        handleStreamError(err);
        return;
      }
    }

    streamRef.current = mediaStream;
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
    setIsStreamActive(true);
  }, [stopStream, handleStreamError]);

  useEffect(() => {
    if (!capturedImage) {
      startStream();
    }
    
    return () => {
      stopStream();
    };
  }, [capturedImage, startStream, stopStream]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && streamRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageDataUrl);
      stopStream();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    // The useEffect will trigger startStream
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const handleRetry = () => {
    setError(null);
    startStream();
  };


  if (error) {
    return (
      <div className="text-center bg-slate-800 p-8 rounded-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Webcam Error</h2>
        <p className="text-slate-300 mb-6">{error}</p>
        <div className="flex gap-4 justify-center">
          <button onClick={onClose} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg">Go Back</button>
          <button onClick={handleRetry} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-slate-800 rounded-lg shadow-2xl p-6 relative">
      <div className="aspect-video bg-black rounded-md overflow-hidden relative flex items-center justify-center">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" className="h-full w-full object-contain" />
        ) : (
          <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
        )}
        {!isStreamActive && !capturedImage && <div className="text-slate-400">Initializing Camera...</div>}
      </div>
      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-6 flex justify-center items-center gap-4">
        <button onClick={onClose} className="absolute top-4 left-4 text-slate-300 hover:text-white transition-colors">
          <BackIcon />
        </button>
        {capturedImage ? (
          <>
            <button onClick={handleRetake} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105">Retake</button>
            <button onClick={handleConfirm} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105 inline-flex items-center gap-2">
              <CheckIcon /> Confirm
            </button>
          </>
        ) : (
          <button onClick={handleCapture} disabled={!isStreamActive} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-bold p-4 rounded-full text-lg inline-flex items-center gap-2 transition-transform transform hover:scale-105 shadow-lg">
            <CameraIcon />
          </button>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;
