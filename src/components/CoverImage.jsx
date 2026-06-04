import { useEffect, useState } from "react";

export default function CoverImage({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className="coverImageWrap">
      {!loaded && (
        <div className="bookCardImageSpinner">
          <div className="spinnerRing spinnerRingSm" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.2s ease" }}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
