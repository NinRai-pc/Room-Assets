import { useLoaderData, Link } from "react-router-dom";
import { getBookings } from "../data";
import type { Booking, Room } from "../data"; // We'll need Room type later
import { getRooms } from "../data";
import "./dashboard.css";

// Loader to get all necessary data for the dashboard
export async function loader() {
  const bookings = await getBookings();
  const rooms = await getRooms(); // We need rooms to display room names
  return { bookings, rooms };
}

// Helper to find room name by its ID
function getRoomName(roomId: string, rooms: Room[]): string {
  const room = rooms.find(r => r.id === roomId);
  return room ? room.name : "Неизвестно";
}

// Helper to format date and time
function formatDateTime(isoString: string) {
    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    };
    return date.toLocaleString('ru-RU', options);
}


export default function Dashboard() {
  const { bookings, rooms } = useLoaderData() as { bookings: Booking[], rooms: Room[] };

  return (
    <div className="dashboard-container">
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{bookings.length}</div>
          <div className="stat-label">Всего бронирований</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">12</div>
          <div className="stat-label">Активных сегодня</div>
          <div className="stat-change">+8%</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">3</div>
          <div className="stat-label">Ожидают подтверждения</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">5</div>
          <div className="stat-label">Отклонено</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">127</div>
          <div className="stat-label">Всего за месяц</div>
          <div className="stat-change stat-down">-12%</div>
        </div>
      </div>

      <div className="dashboard-header">
        <h3>Список бронирований</h3>
        <Link to="/bookings/new" className="button-primary">Новое бронирование</Link>
      </div>

      <div className="filters-bar">
        {/* Filters will be added later */}
        <button className="filter-button active">Все</button>
        <button className="filter-button">Сегодня</button>
        <button className="filter-button">Утренние</button>
        <button className="filter-button">Дневные</button>
      </div>

      <div className="bookings-list">
        <table className="bookings-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Аудитория</th>
                    <th>Дата и время</th>
                    <th>Организатор</th>
                    <th>Мероприятие</th>
                    <th>Статус</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                {bookings.map(booking => (
                    <tr key={booking.id}>
                        <td>#{booking.id.slice(-6)}</td>
                        <td>{getRoomName(booking.resourceId, rooms)}</td>
                        <td>{formatDateTime(booking.start)}</td>
                        <td>Петров П.П.</td> {/* Placeholder */}
                        <td>{booking.title}</td>
                        <td><span className="status status-confirmed">Подтверждено</span></td>
                        <td>
                            <div className="action-buttons">
                                <button title="Редактировать">✏️</button>
                                <button title="Удалить">🗑️</button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}