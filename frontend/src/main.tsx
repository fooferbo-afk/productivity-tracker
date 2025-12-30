/**
 * Application entry point.
 * 
 * Sets up Redux store, auth provider, and router.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from './store';
import { AuthProvider } from './components/auth/AuthProvider';
import { router } from './routes';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </Provider>
  </StrictMode>
);
