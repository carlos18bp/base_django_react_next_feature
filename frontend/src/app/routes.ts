import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import English from "./pages/English";
import ProgramPage from "./pages/ProgramPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "ingles", Component: English },
      { path: ":slug", Component: ProgramPage },
    ],
  },
]);
