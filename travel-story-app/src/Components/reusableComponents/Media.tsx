import React from "react";
import useAssetResource from "../../Hooks/useResource";

interface MediaProps {
  filename: string; 
  type: "photo" | "video"; 
  defaultAsset?: string; 
  altText?: string; 
  controls?: boolean; 
  id?:string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  onClick?: () => void;
  onTouchStart?:() => void;
}

const Media: React.FC<MediaProps> = ({filename ,type ,defaultAsset , altText ,controls = true, autoPlay = true,muted = true, loop = true, playsInline = true, id, className, onClick, onTouchStart}) => {
  const assetUrl = useAssetResource(filename, defaultAsset);

  if (type === "photo") {
    return <img src={assetUrl} alt={altText || "Media"} className={className} id={id} onClick={onClick}/>;
  }

  if (type === "video") {
    return <video src={assetUrl} controls={controls} autoPlay={autoPlay} muted={muted} loop={loop} playsInline={playsInline} className={className} id={id} onClick={onClick} onTouchStart={onTouchStart}/>;
  }

  return null;
};

export default Media;
