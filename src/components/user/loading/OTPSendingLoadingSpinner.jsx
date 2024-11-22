import { useState, useEffect } from "react";

export default function OTPSendingLoadingSpinner() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg flex flex-col items-center max-w-sm w-full mx-4 animate-fade-in">
        <div className="relative">
          <svg
            className="animate-spin h-16 w-16 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          OTP is sending{dots}
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Please wait while we process your request
        </p>
      </div>
    </div>
  );
}
