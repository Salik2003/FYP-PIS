import { useState } from "react";

export interface AlertProps {
  type?: "info" | "success" | "warning" | "error";
  message: string;
  dismissible?: boolean;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({
  type = "info",
  message,
  dismissible = true,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  const alertClasses = {
    info: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
  };

  return (
    <div
      className={`p-4 mb-4 rounded-lg shadow-md ${alertClasses[type]} flex items-center justify-between`}
      role="alert"
    >
      <div className="flex items-center">
        <span className="mr-2">
          {/* Add an appropriate icon based on the alert type */}
          {type === "info" && "ℹ️"}
          {type === "success" && "✅"}
          {type === "warning" && "⚠️"}
          {type === "error" && "❌"}
        </span>
        <span>{message}</span>
      </div>
      {dismissible && (
        <button
          type="button"
          className="ml-4 text-xl leading-none text-current"
          onClick={handleClose}
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;
