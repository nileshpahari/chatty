import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect } from "react";
export default function Protected({
    authRequired=true,
    children,
}: {
    authRequired?: boolean;
    children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { authUser, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    if (isCheckingAuth) return;
    if (authRequired && !authUser) {
      navigate("/login");
    } else if (!authRequired && authUser) {
      navigate("/");
    }
  }, [isCheckingAuth, authUser, authRequired, navigate]);
  if (isCheckingAuth) {
    return <div>Loading...</div>;
  }
  return <>{children}</>;
}
