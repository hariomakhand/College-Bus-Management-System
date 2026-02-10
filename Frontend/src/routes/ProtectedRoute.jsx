import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/auth/check`, {
      method: "GET",
      credentials: "include",
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setIsAuth(data.isAuth); // { isAuth: true }
        } else {
          setIsAuth(false); // agar 401 ya 403 aya to
        }
      })
      .catch(() => setIsAuth(false));
  }, []);

  if (isAuth === null) {
    return <div>Loading...</div>; // jab tak check ho raha hai
  }

  return isAuth ? children : <Navigate to="/login" />;
}
