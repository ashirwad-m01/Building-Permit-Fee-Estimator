
import React from 'react';

interface InputFieldProps {
  label: string;
  id: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'number';
  placeholder?: string;
  unit?: string;
  min?: number;
}

const InputField: React.FC<InputFieldProps> = ({ label, id, value, onChange, type = 'number', placeholder, unit, min = 0 }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-light-secondary dark:text-dark-secondary">
        {label}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          type={type}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          className="block w-full pr-12 pl-4 py-2 bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text border-light-border dark:border-dark-border rounded-md focus:ring-accent focus:border-accent sm:text-sm placeholder-light-secondary/50 dark:placeholder-dark-secondary/70"
        />
        {unit && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-light-secondary dark:text-dark-secondary sm:text-sm">{unit}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputField;