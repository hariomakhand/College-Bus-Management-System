import { RouterProvider } from "react-router-dom";
import router from "./routes/AppRoutes";

import "bootstrap/dist/css/bootstrap.min.css";


function App() {

  return <RouterProvider router={router} />;
}

export default App;
