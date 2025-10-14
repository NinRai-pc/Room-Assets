import { useState } from 'react';
import { Outlet, NavLink, Link } from "react-router-dom";
import { useTheme } from './theme-provider';

function SettingsMenu() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="settings-menu">
            <h4>Theme</h4>
            <div className="theme-options">
                <button className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')}>Light</button>
                <button className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')}>Dark</button>
                <button className={theme === 'oled' ? 'active' : ''} onClick={() => setTheme('oled')}>OLED</button>
            </div>
        </div>
    );
}

export default function Root() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div id="app-layout">
        <header id="topbar">
            <div className="topbar-left">
                <Link to="/" className="logo">Room Booking</Link>
                <nav>
                    <NavLink to={`/`} end>
                        Управление бронированием
                    </NavLink>
                    <NavLink to={`/catalog`}>
                        Каталог аудиторий
                    </NavLink>
                </nav>
            </div>
            <div className="topbar-right">
                <div className="user-profile">
                    <span>🔔</span>
                    <div className="profile-pic"></div>
                </div>
                <button onClick={() => setSettingsOpen(!settingsOpen)} className="settings-button">⚙️</button>
                {settingsOpen && <SettingsMenu />}
            </div>
        </header>
        <main id="detail">
            <Outlet />
        </main>
    </div>
  );
}