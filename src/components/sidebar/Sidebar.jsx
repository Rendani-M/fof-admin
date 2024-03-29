import "./sidebar.css";
import { AddToQueue, ArrowCircleLeft, LineStyle, List, PermIdentity, PlayCircleOutline, QueuePlayNext, Report, Paid, AddCard, MenuBook } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../context/authContext/apiCalls";
import { AuthContext } from "../../context/authContext/AuthContext";
import { useContext, useState } from "react";
import { Typography } from "@mui/material";

export default function Sidebar() {
  const history = useNavigate();
  const { user, dispatch } = useContext(AuthContext);
  const [activeLink, setActiveLink] = useState('/');

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  const handleLogin = async(e) => {
    e.preventDefault();
    await logout(dispatch);
    if(user ===null){
      history("/login");
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebarWrapper">
        <div className="sidebarMenu">
          <h3 className="sidebarTitle">Menu</h3>
          <ul className="sidebarList">
            <Link to="/" className="link">
              <li
                className={`sidebarListItem ${activeLink === '/' ? 'active' : ''}`}
                onClick={() => handleLinkClick('/')}
              >
                <LineStyle className="sidebarIcon" />
                <Typography sx={{ color:'white', fontSize:"small" }}>Home</Typography>
              </li>
            </Link>
            <hr />

            <Link to="/users" className="link">
              <li
                className={`sidebarListItem ${activeLink === '/users' ? 'active' : ''}`}
                onClick={() => handleLinkClick('/users')}
              >
                <PermIdentity className="sidebarIcon" />
                <Typography sx={{ color:'white', fontSize:"small"  }}>User Profile</Typography>
              </li>
            </Link>
            <hr />

            <Link to="/about" className="link">
              <li
                className={`sidebarListItem ${activeLink === '/movies' ? 'active' : ''}`}
                onClick={() => handleLinkClick('/about')}
              >
                <PlayCircleOutline className="sidebarIcon" />
                <Typography sx={{ color:'white', fontSize:"small"  }}>About</Typography>
              </li>
            </Link>
            <hr />

            <Link to="/service" className="link">
              <li
                className={`sidebarListItem ${activeLink === '/lists' ? 'active' : ''}`}
                onClick={() => handleLinkClick('/service')}
              >
                <List className="sidebarIcon" />
                <Typography sx={{ color:'white', fontSize:"small"  }}>Services</Typography>
              </li>
            </Link>
            <hr />
            
            <Link to="/videos" className="link">
              <li
                className={`sidebarListItem ${activeLink === '/videos' ? 'active' : ''}`}
                onClick={() => handleLinkClick('/videos')}
              >
                <AddToQueue className="sidebarIcon" />
                <Typography sx={{ color:'white', fontSize:"small"  }}>Videos</Typography>
              </li>
            </Link>
            <hr />
            
            <Link to="/events" className="link">
              <li
                className={`sidebarListItem ${activeLink === '/events' ? 'active' : ''}`}
                onClick={() => handleLinkClick('/events')}
              >
                <QueuePlayNext className="sidebarIcon" />
                <Typography sx={{ color:'white', fontSize:"small"  }}>Events</Typography>
              </li>
            </Link>
            <hr />
            
            <Link to="/contact" className="link">
              <li
                className={`sidebarListItem ${activeLink === '/contact' ? 'active' : ''}`}
                onClick={() => handleLinkClick('/contact')}
              >
                <QueuePlayNext className="sidebarIcon" />
                <Typography sx={{ color:'white', fontSize:"small"  }}>Contact</Typography>
              </li>
            </Link>
            <hr />
            
            <Link to="/contributions" className="link">
              <li
                className={`sidebarListItem ${activeLink === '/contributions' ? 'active' : ''}`}
                onClick={() => handleLinkClick('/contributions')}
              >
                <AddCard className="sidebarIcon" />
                <Typography sx={{ color:'white', fontSize:"small"  }}>Contribution Cards</Typography>
              </li>
            </Link>
            <hr />
            
            <Link to="/payment-history" className="link">
              <li
                className={`sidebarListItem ${activeLink === '/payment-history' ? 'active' : ''}`}
                onClick={() => handleLinkClick('/payment-history')}
              >
                <Paid className="sidebarIcon" />
                <Typography sx={{ color:'white', fontSize:"small"  }}>Payment History</Typography>
              </li>
            </Link>
            <hr />

            <Link to="/weekly-scriptures" className="link">
              <li
                className={`sidebarListItem ${activeLink === '/lists' ? 'active' : ''}`}
                onClick={() => handleLinkClick('/weekly-scriptures')}
              >
                <MenuBook className="sidebarIcon" />
                <Typography sx={{ color:'white', fontSize:"small"  }}>Weekly Scriptures</Typography>
              </li>
            </Link>
            <hr />
            
            <li className="sidebarListItem" onClick={()=>{window.location.href = "https://flamesoffireministries.co.za/"}}>
              <ArrowCircleLeft className="sidebarIcon" />
              <Typography sx={{ color:'white', fontSize:"small"  }}>Fof website</Typography>
            </li>
            <hr />
            
            <li className="sidebarListItem" onClick={handleLogin}>
              <Report className="sidebarIcon" />
              <Typography sx={{ color:'white', fontSize:"small"  }}>LogOut</Typography>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
