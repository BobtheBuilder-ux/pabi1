import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { AppRoutes } from './routes/AppRoutes';
import { store, persistor } from './lib/store';
import { Toaster } from 'sonner';

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <AppRoutes />
        </Router>
        <Toaster 
          position="bottom-right" 
          richColors 
          expand={false} 
          duration={2000} 
          closeButton
        />
      </PersistGate>
    </Provider>
  );
};