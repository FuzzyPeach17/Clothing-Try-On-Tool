
import React from 'react';

interface LoaderProps {
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-800/50 rounded-lg">
      <div className="w-16 h-16 border-4 border-t-indigo-500 border-r-indigo-500 border-b-slate-600 border-l-slate-600 rounded-full animate-spin mb-4"></div>
      <p className="text-lg text-slate-200 font-semibold">{text}</p>
    </div>
  );
};

export default Loader;
