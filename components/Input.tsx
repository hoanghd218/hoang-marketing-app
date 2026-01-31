import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-500">{label}</label>}
      <input
        className={`w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${className}`}
        {...props}
      />
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-500">{label}</label>}
      <textarea
        className={`w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-h-[100px] ${className}`}
        {...props}
      />
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: string[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-500">{label}</label>}
      <select
        className={`w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-white text-slate-900">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};