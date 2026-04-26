const Skeleton = ({ type = 'text', lines = 1, className = '' }) => {
  if (type === 'card') {
    return (
      <div className={`card-wood p-6 animate-pulse ${className}`}>
        <div className="h-4 w-24 bg-wood-light/30 rounded mb-4"></div>
        <div className="h-8 w-32 bg-wood-light/30 rounded"></div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`space-y-3 animate-pulse ${className}`}>
        <div className="h-10 bg-wood-light/30 rounded-xl"></div>
        {[...Array(lines)].map((_, i) => (
          <div key={i} className="h-12 bg-wood-light/30 rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card-wood p-6 animate-pulse">
            <div className="h-4 w-24 bg-wood-light/30 rounded mb-4"></div>
            <div className="h-8 w-32 bg-wood-light/30 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // Default text skeleton
  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <div key={i} className="h-4 bg-wood-light/30 rounded w-full"></div>
      ))}
    </div>
  );
};

export default Skeleton;
