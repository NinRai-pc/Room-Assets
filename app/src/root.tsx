import { Outlet, NavLink } from "react-router-dom";

export default function Root() {
  return (
    <>
      <div id="sidebar">
        <h1>Room Booking</h1>
        <nav>
          <ul>
            <li>
              <NavLink to={`/`} end>
                Управление бронированием
              </NavLink>
            </li>
            <li>
              <NavLink to={`/catalog`}>Каталог аудиторий</NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <div id="detail">
        <Outlet />
      </div>
    </>
  );
}