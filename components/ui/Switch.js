
export function Switch({ checked, onCheckedChange, className = "" }) {
    return (
        <div
            className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${checked ? "bg-gray-900" : "bg-gray-200"} ${className}`}
            onClick={() => onCheckedChange(!checked)}
        >
            <span
                className={`inline-block w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-1"}`}
            />
        </div>
    );
}
