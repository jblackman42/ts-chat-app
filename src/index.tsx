import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';
import './styles/main.css';

import { Home, Register } from './Pages';
const Error = () => <p>Something went wrong</p>;

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/:serverCode",
    element: <Home />
  },
  {
    path: "/register",
    element: <Register />
  },

]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <>
    <RouterProvider router={router} />
  </>
);
