import React, { useState } from 'react';

const FoodImage = ({ src, alt, className, style }) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div 
        className={`${className} bg-stone-200 text-stone-500 flex flex-col items-center justify-center text-center p-2 select-none`}
        style={style}
      >
        <span className="text-xl">🍲</span>
        <span className="text-[10px] font-bold line-clamp-1 opacity-70 mt-1">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

export default FoodImage;