
import React from 'react';

interface SelectFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { id: string; name: string }[];
  disabled?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, id, value, onChange, options, disabled = false }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-light-secondary dark:text-dark-secondary">
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text border-light-border dark:border-dark-border focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md disabled:bg-light-border/50 dark:disabled:bg-dark-border/50 disabled:cursor-not-allowed"
      >
        <option value="" disabled>Select an option</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;