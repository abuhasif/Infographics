// src/components/Dropdown.tsx
import React from 'react';

interface DropdownProps {
  label: string;
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, selected, onChange }) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>{label}</label>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', padding: '8px' }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
