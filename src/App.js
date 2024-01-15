import Sidebar from "./components/sidebar/Sidebar";
import Topbar from "./components/topbar/Topbar";
import Home from "./pages/home/Home";
import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
  Outlet,
} from "react-router-dom";
import UserList from "./pages/userList/UserList";
import Login from "./pages/login/Login";
import { AuthContext } from "./context/authContext/AuthContext";
import { useContext } from "react";
import Service from "./pages/service/Service";
import { Box } from "@mui/material";
import About from "./pages/About/About";
import Videos from "./pages/Videos/Videos";
import Events from "./pages/Events/Events";
import Contact from "./pages/Contact/Contact";
import User from "./pages/User/User";
import Payment from "./pages/Payments/Payment";
import History from "./pages/Payments/History";
import Readings from "./pages/Readings/Readings";

function App() {
  const { user } = useContext(AuthContext);
  const Layout = () => { 
    return (
      <Box>
        <Box sx={{ display:{xs:'block', sm:'none', md:'none'} }}>
          <Topbar/>
        </Box>
        <Box sx={{ background:'#ecececc0', display:'flex', overflow:'hidden', height:'100vh', alignItems: 'flex-start' }}>
          <Box sx={{ display:{xs:'none', sm:'block'} }}>
            <Sidebar />
          </Box>
          
          <Outlet />
        </Box>
      </Box>
    );
    
  };

  const ProtectedRoute = ({ children }) => {
    // console.log("user: ", user)
    if (!user) {
      console.log("back to login")
      return <Navigate to="/login" />;
    }

    return children;
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/users",
          element: user?.status === process.env.REACT_APP_SUPER_ADMIN_STATUS? <UserList />: <User />,
        },
        {
          path: "/about",
          element: <About />,
        },
        {
          path: "/videos",
          element: <Videos />,
        },
        {
          path: "/service",
          element: <Service/>,
        },
        {
          path: "/events",
          element: <Events />,
        },
        {
          path: "/contact",
          element: <Contact />,
        },
        {
          path: "/contributions",
          element: <Payment />,
        },
        {
          path: "/payment-history",
          element: <History />,
        },
        {
          path: "/weekly-scriptures",
          element: <Readings />,
        },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
  ]);
  
  return (
    <div style={{ overflowY:'auto' }}>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
