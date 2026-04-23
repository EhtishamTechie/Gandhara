import React, { useEffect, useRef } from 'react';

// Protected Image Component
export const ProtectedImage = ({ src, alt, className, style, ...props }) => {
  const imgRef = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    img.addEventListener('contextmenu', handleContextMenu);
    img.addEventListener('dragstart', handleDragStart);

    return () => {
      img.removeEventListener('contextmenu', handleContextMenu);
      img.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={className}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        WebkitUserDrag: 'none',
        ...style
      }}
      {...props}
      draggable="false"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    />
  );
};

// Protected Video Component
export const ProtectedVideo = ({ src, className, style, ...props }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    video.addEventListener('contextmenu', handleContextMenu);

    return () => {
      video.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        ...style
      }}
      {...props}
      controlsList="nodownload"
      onContextMenu={(e) => e.preventDefault()}
      disablePictureInPicture
    />
  );
};

// Global protection for all images and videos
export const GlobalMediaProtection = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      img, video {
        -webkit-user-drag: none !important;
        user-drag: none !important;
        -webkit-user-select: none !important;
        user-select: none !important;
      }
    `;
    document.head.appendChild(style);

    const preventEvent = (e) => {
      if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', preventEvent);
    document.addEventListener('dragstart', preventEvent);

    return () => {
      document.removeEventListener('contextmenu', preventEvent);
      document.removeEventListener('dragstart', preventEvent);
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  return null;
};
