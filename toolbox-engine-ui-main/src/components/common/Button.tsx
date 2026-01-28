export default function Button({ children, onClick, className, disabled }: { children: React.ReactNode, onClick: () => void, className?: string, disabled?: boolean }) {
    const baseClasses = "mb-2 px-2 py-1 text-sm rounded-md transition";
    const enabledClasses = "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer";
    const disabledClasses = "bg-gray-400 text-gray-600 cursor-not-allowed";
    
    const buttonClasses = disabled 
        ? `${baseClasses} ${disabledClasses} ${className || ''}`
        : `${baseClasses} ${enabledClasses} ${className || ''}`;
    
    return (
        <button 
            onClick={onClick} 
            className={buttonClasses}
            disabled={disabled}
        >
            {children}
        </button>
    );
}