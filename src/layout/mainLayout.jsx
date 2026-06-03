import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar.jsx";
import BottomNav from "../components/BottomNav.jsx";

export default function MainLayout() {
  return (
    <div className="appContainer">
      <Sidebar />
      <div className="appMain">
        <main className="pageContent">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
