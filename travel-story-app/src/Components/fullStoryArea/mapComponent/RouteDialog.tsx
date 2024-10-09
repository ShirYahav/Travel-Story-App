import React, { useEffect, useState } from 'react';
import './RouteDialog.css';
import closeSvg from '../../../assets/SVGs/close-svgrepo-com.png';
import RouteModel from '../../../Models/RouteModel';

interface RouteDialogProps {
  route: RouteModel; 
  open: boolean;
  onClose: () => void;
  x: number; 
  y: number; 
}

const RouteDialog: React.FC<RouteDialogProps> = ({ route, open, onClose, x, y }) => {
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
          <p><strong>Origin:</strong> {route.origin}</p>
          <p><strong>Destination:</strong> {route.destination}</p>
          <p><strong>Transport Type:</strong> {route.transportType}</p>
          <p><strong>Time:</strong> {route.duration} minutes</p>
          {route.note && <p><strong>Note:</strong> {route.note}</p>}
          {route.cost && <p><strong>Cost:</strong> {route.cost} {route.currency}</p>}
        </div>
      </div>
    </div>
  );
};

export default RouteDialog;
