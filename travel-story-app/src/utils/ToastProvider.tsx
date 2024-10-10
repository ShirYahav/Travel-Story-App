import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastProvider: React.FC = () => {
  return (
    <Toaster
      toastOptions={{
        style: {
          border: '1px solid #473D3A',
          padding: '13px',
          color: '#473D3A',
        },
        iconTheme: {
          primary: '#B25E39',
          secondary: '#FFFAEE',
        },
      }}
    />
  );
};

export default ToastProvider;
