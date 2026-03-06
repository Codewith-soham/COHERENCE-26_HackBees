import { forwardRef } from 'react';
import './Select.css';

const Select = forwardRef(({ label, error, options = [], className = '', ...props }, ref) => {
    return (
        <div className={`select-group ${className}`}>
            {label && <label className="select-label">{label}</label>}
            <div className="select-wrapper">
                <select
                    ref={ref}
                    className={`select-field ${error ? 'select-error' : ''}`}
                    {...props}
                >
                    {options.map((option, index) => (
                        <option key={index} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {/* Custom arrow icon for better visuals */}
                <div className="select-arrow">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
            </div>
            {error && <span className="error-message">{error}</span>}
        </div>
    );
});

Select.displayName = 'Select';
export default Select;
