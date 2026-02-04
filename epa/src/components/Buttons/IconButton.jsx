export default function IconButton({ title, className = "", children, ...props }) {
  return (
    <button
      title={title}
      className={`inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}