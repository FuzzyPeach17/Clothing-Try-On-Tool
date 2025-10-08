
import React from 'react';

interface ResultDisplayProps {
  userImage: string;
  clothingImage: string;
  generatedImage: string;
  onTryAnother: () => void;
  onStartOver: () => void;
}

const ImageCard: React.FC<{ title: string, imageUrl: string, isOriginal?: boolean }> = ({ title, imageUrl, isOriginal = false }) => (
    <div className="flex flex-col items-center">
        <h3 className="text-xl font-semibold mb-3 text-slate-200">{title}</h3>
        <div className="w-full aspect-[3/4] bg-slate-800 rounded-lg overflow-hidden shadow-lg">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
    </div>
);

const ResultDisplay: React.FC<ResultDisplayProps> = ({ userImage, clothingImage, generatedImage, onTryAnother, onStartOver }) => {
  return (
    <div className="w-full max-w-6xl mx-auto text-center p-4">
      <h2 className="text-4xl font-bold mb-2 text-white">Your New Look!</h2>
      <p className="text-slate-300 mb-8">Here's a comparison of your original photo and your virtual try-on.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <ImageCard title="Original You" imageUrl={userImage} isOriginal={true} />
        <ImageCard title="Virtual Try-On" imageUrl={generatedImage} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onTryAnother}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105"
        >
          Try Another Outfit
        </button>
        <button
          onClick={onStartOver}
          className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;
