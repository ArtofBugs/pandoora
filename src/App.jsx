import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./components/Header";

function App() {
  // Only render header on non-home pages
  const location = useLocation();
  const renderHeader = location.pathname != "/";
  return (
    <>
      <div className="flex flex-col h-screen w-screen">
        {renderHeader ? <Header /> : null}
        <Outlet />
      </div>
    </>
  );
}

export default App;
