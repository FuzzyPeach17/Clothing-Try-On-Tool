
import React, { useState, useMemo } from 'react';
import { UserMeasurements } from '../types';

interface TryOnFormProps {
  onSubmit: (clothingUrl: string, measurements: UserMeasurements) => void;
  isGenerating: boolean;
  initialMeasurements: UserMeasurements;
}

const InputField: React.FC<{id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder?: string, type?: string}> = ({ id, label, value, onChange, placeholder, type = 'text' }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <input
            type={type}
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            required
        />
    </div>
);


const TryOnForm: React.FC<TryOnFormProps> = ({ onSubmit, isGenerating, initialMeasurements }) => {
  const [clothingUrl, setClothingUrl] = useState('');
  const [measurements, setMeasurements] = useState<UserMeasurements>(initialMeasurements);

  const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMeasurements(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = useMemo(() => {
    // FIX: Cast value to string before calling trim() to resolve TypeScript error where 'val' is of type 'unknown'.
    return clothingUrl.trim() !== '' && Object.values(measurements).every(val => String(val).trim() !== '');
  }, [clothingUrl, measurements]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit(clothingUrl, measurements);
    }
  };

  return (
    <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full">
      <h2 className="text-2xl font-bold mb-1 text-white">Enter Details</h2>
      <p className="text-slate-400 mb-6">Provide a link to the clothing and your measurements.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="clothingUrl" className="block text-sm font-medium text-slate-300 mb-1">Clothing Image URL</label>
          <input
            type="url"
            id="clothingUrl"
            name="clothingUrl"
            value={clothingUrl}
            onChange={(e) => setClothingUrl(e.target.value)}
            placeholder="https://.../image.jpg"
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            required
          />
           <p className="text-xs text-slate-500 mt-1">Right-click on a product image and 'Copy Image Address'.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField id="weight" label="Weight" value={measurements.weight} onChange={handleMeasurementChange} placeholder="e.g., 150 lbs or 70 kg" />
            <InputField id="height" label="Height" value={measurements.height} onChange={handleMeasurementChange} placeholder="e.g., 5' 8'' or 173 cm" />
            <InputField id="braSize" label="Bra Size" value={measurements.braSize} onChange={handleMeasurementChange} placeholder="e.g., 34C" />
            <InputField id="clothingSize" label="Clothing Size" value={measurements.clothingSize} onChange={handleMeasurementChange} placeholder="e.g., M or US 8" />
        </div>

        <button
          type="submit"
          disabled={!isFormValid || isGenerating}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg text-lg transition-all transform hover:scale-105"
        >
          {isGenerating ? 'Generating...' : 'Generate My Look'}
        </button>
      </form>
    </div>
  );
};

export default TryOnForm;
