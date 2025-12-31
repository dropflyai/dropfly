
export function Textarea({ value, onChange, placeholder, className = "", rows = 4 }) {
    return (
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 resize-vertical ${className}`}
        />
    );
}
