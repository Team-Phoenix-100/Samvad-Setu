import React from 'react';

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer";
  
  const variants = {
    primary: "bg-[#E8A33D] hover:bg-[#d49232] text-[#0F1B1E] font-semibold",
    secondary: "bg-surface-raised hover:bg-[#28434a] text-primary-custom border border-[#2F9E8F]/30",
    danger: "bg-[#C1443B] hover:bg-[#a83a32] text-primary-custom",
    outline: "border border-[#9BA8A6]/40 text-primary-custom hover:bg-surface"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}