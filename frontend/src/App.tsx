import { Outlet } from "react-router-dom";
import { useThemeStore } from "./store/useThemeStore";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";

function App() {
  const {authUser, getAuthUser, isCheckingAuth} = useAuthStore()
  const { theme } = useThemeStore();
  console.log(theme);
  useEffect(()=>{
    getAuthUser()
  }, [])
  return (
    <>
      <div datatype="theme" data-theme={theme}>
        <Outlet />
      </div>
    </>
  );
}

export default App;
