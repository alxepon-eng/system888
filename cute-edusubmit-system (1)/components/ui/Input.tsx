import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-gray-800 font-bold ml-1">{label}</label>}
      <input
        className={`w-full px-4 py-2 rounded-xl border-2 border-black focus:outline-none focus:ring-2 focus:ring-pink-300 neo-brutalism-sm ${className}`}
        {...props}
      />
      {error && <span className="text-red-500 text-sm ml-1">{error}</span>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
    disablePlaceholder?: boolean;
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  options, 
  placeholder, 
  disablePlaceholder = true, 
  className = '', 
  ...props 
}) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-gray-800 font-bold ml-1">{label}</label>}
        <select
          className={`w-full px-4 py-2 rounded-xl border-2 border-black focus:outline-none focus:ring-2 focus:ring-pink-300 neo-brutalism-sm bg-white ${className}`}
          {...props}
        >
            <option value="" disabled={disablePlaceholder}>{placeholder || "-- กรุณาเลือก --"}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
      </div>
    );
  };