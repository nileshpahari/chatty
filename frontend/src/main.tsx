import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Protected from "./components/Protected.tsx";
import Login from "./pages/Login.tsx";
import Settings from "./pages/Settings.tsx";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Profile from "./pages/Profile.tsx";
import Chat from "./pages/Chat.tsx";
import Signup from "./pages/Signup.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "login",
        element: (
          <Protected authRequired={false}>
            <Login />
          </Protected>
        ),
      },
      {
        path: "signup",
        element: (
          <Protected authRequired={false}>
            <Signup />
          </Protected>
        ),
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "profile",
        element: (
          <Protected>
            <Profile />
          </Protected>
        ),
      },
      {
        path: "chat",
        element: (
          <Protected>
            <Chat />
          </Protected>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
