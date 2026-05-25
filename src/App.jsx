import { Outlet, useLocation } from "react-router-dom";

import { useAuthState } from "react-firebase-hooks/auth";

import { auth } from "./firebase/initialize";
import { Header } from "./components/Header";

function App() {
  const [user, loading, error] = useAuthState(auth);
  // Only render header on non-home pages
  const location = useLocation();
  const renderHeader = location.pathname != "/";
  return (
    <>
      <div className="flex flex-col h-screen w-screen">
        {renderHeader ? <Header /> : null}
        {<Outlet />}
      </div>
    </>
  );
}

export default App;
