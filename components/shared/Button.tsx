
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50";

  const variantClasses = {
    primary: 'text-white bg-primary hover:bg-indigo-700 focus:ring-primary',
    secondary: 'text-text-primary bg-gray-200 hover:bg-gray-300 focus:ring-primary',
    danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
