import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css';
import { action as destroyAction } from "./routes/destroy.tsx";
import Dashboard, { loader as dashboardLoader } from "./routes/dashboard.tsx";
import Root from './root.tsx'; 
import ErrorPage from './error-page.tsx';
import NewBooking, {
  loader as newBookingLoader,
  action as newBookingAction,
} from "./routes/new-booking.tsx";
import Catalog, { 
  loader as catalogLoader,
  action as catalogAction 
} from './routes/catalog.tsx';
import EditRoom, {
  loader as editLoader,
  action as editAction,
} from './routes/edit.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/bookings/new",
        element: <NewBooking />,
        loader: newBookingLoader,
        action: newBookingAction,
      },
      {
        index: true,
        element: <Dashboard />,
        loader: dashboardLoader,
      },
      {
        path: "catalog",
        element: <Catalog />,
        loader: catalogLoader,
        action: catalogAction,
      },
      {
        path: "catalog/:roomId/edit",
        element: <EditRoom />,
        loader: editLoader,
        action: editAction,
      },
            {
        path: "catalog/:roomId/destroy",
        action: destroyAction,
      },
    ],
  },
]);

import { seedData } from './data';
seedData();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);