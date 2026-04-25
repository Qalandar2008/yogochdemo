const StatsBox = ({ title, value, unit = '', icon: Icon, color = 'blue', isLoading = false }) => {
  const colorClasses = {
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    dark: 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
  };

  return (
    <div className="card-wood p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 truncate">{title}</p>
          {isLoading ? (
            <div className="h-6 sm:h-8 w-20 sm:w-24 skeleton rounded"></div>
          ) : (
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-100 truncate">
              {typeof value === 'number' ? value.toLocaleString() : value}
              {unit && <span className="text-xs sm:text-sm font-normal ml-1">{unit}</span>}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl flex-shrink-0 ${colorClasses[color]}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsBox;
