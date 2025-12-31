import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const NotificationToast = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getToastColor = (type) => {
    const colors = {
      success: 'bg-green-500 border-green-600',
      warning: 'bg-yellow-500 border-yellow-600',
      error: 'bg-red-500 border-red-600',
      info: 'bg-blue-500 border-blue-600'
    };
    return colors[type] || colors.info;
  };

  const getIcon = (type) => {
    const icons = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`${getToastColor(notification.type)} text-white p-4 rounded-lg shadow-lg border-l-4 max-w-sm`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <span className="text-lg">{getIcon(notification.type)}</span>
            <div>
              <h4 className="font-semibold text-sm">{notification.title}</h4>
              <p className="text-xs mt-1 opacity-90">{notification.message}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-white hover:text-gray-200 ml-2"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;