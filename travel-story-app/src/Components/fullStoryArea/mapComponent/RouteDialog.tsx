import React, { useEffect, useState } from 'react';
import './RouteDialog.css';
import closeSvg from '../../../assets/SVGs/close-svgrepo-com.png'

interface RouteDialogProps {
  origin: string;
  destination:string;
  open: boolean;
  onClose: () => void;
  transportType: string;
  time: number;
  note: string;
  cost: number;
  x: number; // X position of the click
  y: number; // Y position of the click
}

const RouteDialog: React.FC<RouteDialogProps> = ({ open, onClose,origin, destination, transportType, time, note, cost, x, y }) => {
  const [isMobile, setIsMobile] = useState(false);

  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile(); 
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile); 
    };
  }, []);

  if (!open) return null;
  
  const dialogStyle = isMobile
    ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } 
    : { top: `${y}px`, left: `${x}px` }; 

  return (
    <div className="dialogOverlay" style={dialogStyle}>
      <button className="closeDialogButton" onClick={onClose}>
        <img src={closeSvg} alt="close-dialog" />
      </button>
      <div className="dialogContent" onClick={(e) => e.stopPropagation()}>
        <h4>Transportation Information</h4>
        <div className="dialogInfo">
          <p><strong>Origin:</strong> {origin}</p>
          <p><strong>Destination:</strong> {destination}</p>
          <p><strong>Transport Type:</strong> {transportType}</p>
          <p><strong>Time:</strong> {time} minutes</p>
          {note && <p><strong>Note:</strong> {note}</p>}
          {cost && <p><strong>Cost:</strong> {cost}</p>}
        </div>
      </div>
    </div>
  );
};

export default RouteDialog;

