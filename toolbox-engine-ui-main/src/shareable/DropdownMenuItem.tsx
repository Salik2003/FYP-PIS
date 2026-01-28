import React from "react";

interface DropdownMenuItemProps {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ label, onClick, danger }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-2 py-1 text-sm hover:bg-gray-100 whitespace-nowrap cursor-pointer ${
        danger ? "text-red-600" : "text-gray-700"
      }`}
    >
      {label}
    </button>
  );
};

export default DropdownMenuItem;
