import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, ChevronDown, ChevronUp } from 'lucide-react';

const DataTable = ({ 
  columns, 
  data, 
  searchable = true, 
  searchPlaceholder = 'Search...',
  pagination = true,
  itemsPerPage = 10,
  isLoading = false,
  emptyMessage = 'No data found',
  mobileCardView = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedMobileRows, setExpandedMobileRows] = useState({});

  // Filter data
  const filteredData = searchTerm
    ? data.filter((row) =>
        columns.some((col) => {
          const value = row[col.key];
          return value && String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      )
    : data;

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = pagination
    ? filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredData;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const toggleMobileRow = (index) => {
    setExpandedMobileRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="h-9 sm:h-10 w-full skeleton rounded-xl"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 sm:h-12 w-full skeleton rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search */}
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="input-field pl-9 sm:pl-10 text-sm sm:text-base"
          />
        </div>
      )}

      {/* Mobile Card View */}
      {mobileCardView && (
        <div className="sm:hidden space-y-2">
          {paginatedData.length > 0 ? (
            paginatedData.map((row, index) => {
              const isExpanded = expandedMobileRows[index];
              // Get first column as title (usually name)
              const titleCol = columns[0];
              const titleValue = titleCol?.render ? titleCol.render(row[titleCol.key], row) : row[titleCol?.key];
              
              return (
                <div key={row.id || index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  {/* Card Header */}
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleMobileRow(index)}
                  >
                    <div className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate pr-2">
                      {titleValue}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Actions column (last column) */}
                      {columns[columns.length - 1]?.key === 'actions' && (
                        <div onClick={(e) => e.stopPropagation()}>
                          {columns[columns.length - 1].render(null, row)}
                        </div>
                      )}
                      <button className="p-1 text-gray-500 dark:text-gray-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
                      {columns.slice(1, -1).map((col) => (
                        <div key={col.key} className="flex justify-between items-center text-xs">
                          <span className="text-gray-500 dark:text-gray-400">{col.label}</span>
                          <span className="text-gray-800 dark:text-gray-100 font-medium">
                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
              {emptyMessage}
            </div>
          )}
        </div>
      )}

      {/* Desktop Table View */}
      <div className={`${mobileCardView ? 'hidden sm:block' : ''} overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700`}>
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <tr key={row.id || index} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-800 dark:text-gray-100 whitespace-nowrap">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 sm:py-8 text-center text-gray-400 dark:text-gray-500 text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
            <span className="hidden sm:inline">Showing </span>
            {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} / {filteredData.length}
          </p>
          <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 sm:p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <div className="flex items-center gap-0.5 sm:gap-1">
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                  if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                }
                if (pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`min-w-[26px] sm:min-w-[32px] h-6 sm:h-8 px-1 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 sm:p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
