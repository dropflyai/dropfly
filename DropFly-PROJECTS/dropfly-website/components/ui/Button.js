
export function Button({ children, onClick, className = "", variant = "primary" }) {
    const baseClasses = "px-6 py-3 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variants = {
        primary: "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500",
        secondary: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500",
        ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500"
    };

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}
