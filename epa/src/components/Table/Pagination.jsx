import { ArrowLeft } from "lucide-react";

export default function Pagination({ 
  page, 
  total, 
  onChange,
  showPageInfo = true // Optional: show "Page X of Y"
}) {
  
  const getPageNumbers = () => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    const pageNumbers = [1, 2, 3, 4, 5];
    
    if (page > 5) {
      return [1, '...', page - 2, page - 1, page, '...', total];
    }
    
    return [...pageNumbers, '...', total];
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between py-3">
      {showPageInfo && (
        <div className="text-sm text-gray-600">
          Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{total}</span>
        </div>
      )}
      
      <div className="flex items-center gap-3 ml-auto">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className={`rounded-md items-center flex border px-3 py-1.5 text-sm ${
            page === 1
              ? "border-gray-200 text-gray-400 cursor-not-allowed"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <ArrowLeft className="h-3 mr-1" />
          Prev
        </button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((p, index) =>
            p === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p)}
                className={`h-8 w-8 rounded-md text-sm ${
                  p === page
                    ? "bg-green-700 font-semibold text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onChange(Math.min(total, page + 1))}
          disabled={page === total}
          className={`rounded-md flex items-center border px-3 py-1.5 text-sm ${
            page === total
              ? "border-gray-200 text-gray-400 cursor-not-allowed"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          Next
          <ArrowLeft className="rotate-180 h-3 ml-1" />
        </button>
      </div>
    </div>
  );
}