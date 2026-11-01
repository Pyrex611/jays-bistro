import React, { useState } from 'react';

const ImageWithFallback = ({ src, alt, className }) => {
  const [error, setError] = useState(false);
  const fallbackSrc = `https://placehold.co/400x400/1A1A1A/C5A059?text=${encodeURIComponent(alt)}`;
  return (
    <img 
      src={error ? fallbackSrc : src} 
      alt={alt} 
      className={className} 
      loading="lazy" 
      onError={() => setError(true)} 
    />
  );
};

export default ImageWithFallback;