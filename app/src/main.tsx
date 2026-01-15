import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css';

import { ThemeProvider } from './theme-provider.tsx';

import Root from './root.tsx';
import ErrorPage from './error-page.tsx';

import Dashboard, { loader as dashboardLoader } from "./routes/dashboard.tsx";
import Catalog, {
  loader as catalogLoader,
  actionMassUpdate as catalogAction
} from './routes/catalog.tsx';
import EditRoom, {
  loader as editLoader,
  action as editAction,
  actionCreate as createAction
} from './routes/edit.tsx';
import { action as destroyAction } from "./routes/destroy.tsx";
import NewBooking, {
  loader as newBookingLoader,
  action as newBookingAction,
} from "./routes/new-booking.tsx";
import EditBooking, {
  loader as editBookingLoader,
  action as editBookingAction,
} from "./routes/edit-booking.tsx";
import { action as destroyBookingAction } from "./routes/booking-destroy.tsx";

import { seedData } from './data.ts';
seedData();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
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
        path: "catalog/new",
        element: <EditRoom />,
        loader: editLoader,
        action: createAction,
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
        errorElement: <div>Oops! There was an error deleting this room.</div>,
      },
      {
        path: "/bookings/new",
        element: <NewBooking />,
        loader: newBookingLoader,
        action: newBookingAction,
      },
      {
        path: "/bookings/:bookingId/edit",
        element: <EditBooking />,
        loader: editBookingLoader,
        action: editBookingAction,
      },
      {
        path: "/bookings/:bookingId/destroy",
        action: destroyBookingAction,
        errorElement: <div>Oops! There was an error deleting this booking.</div>,
      },
    ],
  },
], { basename: '/Room-Assets' });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
);