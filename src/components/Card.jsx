const Card = ({ children, className = '', title, icon: Icon }) => {
  return (
    <div className={`card-wood p-3 sm:p-4 lg:p-6 ${className}`}>
      {(title || Icon) && (
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />}
          {title && <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">{title}</h3>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
