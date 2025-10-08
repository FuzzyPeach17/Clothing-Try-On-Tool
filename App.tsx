
import React, { useState, useCallback } from 'react';
import { UserMeasurements } from './types';
import { generateVirtualTryOnImage } from './services/geminiService';
import WebcamCapture from './components/WebcamCapture';
import TryOnForm from './components/TryOnForm';
import ResultDisplay from './components/ResultDisplay';
import Loader from './components/Loader';
import { CameraIcon } from './components/icons';

type AppState = 'initial' | 'capturing' | 'captured' | 'generating' | 'result' | 'error';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('initial');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clothingUrlForDisplay, setClothingUrlForDisplay] = useState<string>('');
  const [measurements, setMeasurements] = useState<UserMeasurements>({
    weight: '',
    height: '',
    braSize: '',
    clothingSize: '',
  });

  const handleStart = () => {
    setAppState('capturing');
  };

  const handleCapture = useCallback((imageDataUrl: string) => {
    setUserImage(imageDataUrl);
    setAppState('captured');
  }, []);

  const handleCloseWebcam = useCallback(() => {
    setAppState('initial');
  }, []);

  const handleGenerate = async (clothingUrl: string, newMeasurements: UserMeasurements) => {
    if (!userImage) {
      setError("User image is missing.");
      setAppState('error');
      return;
    }

    setAppState('generating');
    setError(null);
    setClothingUrlForDisplay(clothingUrl);
    setMeasurements(newMeasurements);

    try {
      const userImageBase64 = userImage.split(',')[1];
      const resultBase64 = await generateVirtualTryOnImage(userImageBase64, clothingUrl, newMeasurements);
      setGeneratedImage(`data:image/png;base64,${resultBase64}`);
      setAppState('result');
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unknown error occurred during image generation.");
      setAppState('error');
    }
  };
  
  const handleReset = () => {
    setAppState('initial');
    setUserImage(null);
    setGeneratedImage(null);
    setError(null);
    setClothingUrlForDisplay('');
    setMeasurements({ weight: '', height: '', braSize: '', clothingSize: '' });
  };

  const handleTryAnother = () => {
    setAppState('captured');
    setGeneratedImage(null);
    setError(null);
    setClothingUrlForDisplay('');
  };

  const renderContent = () => {
    switch (appState) {
      case 'initial':
        return (
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Virtual Try-On AI</h1>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">Upload a photo of yourself and provide a link to a clothing item to see how it looks on you. Powered by Gemini.</p>
            <button onClick={handleStart} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg inline-flex items-center gap-2 transition-transform transform hover:scale-105">
              <CameraIcon />
              Start Virtual Try-On
            </button>
          </div>
        );
      case 'capturing':
        return <WebcamCapture onCapture={handleCapture} onClose={handleCloseWebcam} />;
      case 'captured':
        return (
          <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-bold mb-4 text-white">Your Photo</h2>
              <img src={userImage!} alt="User capture" className="rounded-lg shadow-lg w-full max-w-md" />
              <button onClick={() => setAppState('capturing')} className="mt-4 text-indigo-400 hover:text-indigo-300">Retake Photo</button>
            </div>
            <TryOnForm onSubmit={handleGenerate} isGenerating={false} initialMeasurements={measurements} />
          </div>
        );
      case 'generating':
        return <Loader text="Our AI stylist is creating your look... This may take a moment." />;
      case 'result':
        return <ResultDisplay userImage={userImage!} clothingImage={clothingUrlForDisplay} generatedImage={generatedImage!} onTryAnother={handleTryAnother} onStartOver={handleReset} />;
      case 'error':
        return (
          <div className="text-center bg-slate-800 p-8 rounded-lg">
            <h2 className="text-3xl font-bold text-red-500 mb-4">Something Went Wrong</h2>
            <p className="text-slate-300 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button onClick={handleReset} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded">Start Over</button>
              <button onClick={() => setAppState('captured')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">Try Again</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-900 bg-grid-slate-700/[0.2]">
      <div className="w-full flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
