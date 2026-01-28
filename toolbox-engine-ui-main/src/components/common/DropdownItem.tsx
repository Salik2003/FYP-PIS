import React, { useState, useRef, useEffect } from "react";
import DropdownMenuItem from "../../shareable/DropdownMenuItem";

export interface DropdownItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

interface DropdownMenuProps {
  items: DropdownItem[];
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ items }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Trigger button */}
      <button
        type="button"
        className="px-2 py-1 text-gray-600 hover:text-gray-900 rounded-full border border-gray-300 hover:bg-gray-100 cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        &#x22EE;
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          {items.map((item, index) => (
            <DropdownMenuItem
              key={index}
              label={item.label}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              danger={item.danger}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
