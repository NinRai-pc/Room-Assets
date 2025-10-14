import React from "react";
import { useLoaderData, Link } from "react-router-dom";
import { getBookings, getRooms } from "../data";
import type { Booking, Room } from "../data";
import "./dashboard.css";

export async function loader() {
  const bookings = await getBookings();
  const rooms = await getRooms();
  return { bookings, rooms };
}

function getRoomName(roomId: string, rooms: Room[]): string {
  const room = rooms.find(r => r.id === roomId);
  return room ? room.name : "Неизвестно";
}

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

  const dashboardStats = React.useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const activeToday = bookings.filter(b => {
        const startDate = new Date(b.start);
        return startDate >= todayStart && startDate < todayEnd;
    }).length;

    const pending = bookings.filter(b => b.status === 'pending').length;
    const rejected = bookings.filter(b => b.status === 'rejected').length;
    const thisMonth = bookings.filter(b => new Date(b.start) >= monthStart).length;

    return { total: bookings.length, activeToday, pending, rejected, thisMonth };
  }, [bookings]);

  const getStatusInfo = (status: Booking['status']) => {
    switch (status) {
        case 'confirmed': return { text: 'Подтверждено', className: 'status-confirmed' };
        case 'pending': return { text: 'В ожидании', className: 'status-pending' };
        case 'rejected': return { text: 'Отклонено', className: 'status-rejected' };
        default: return { text: 'Неизвестно', className: '' };
    }
  }

  return (
    <div className="dashboard-container">
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{dashboardStats.total}</div>
          <div className="stat-label">Всего бронирований</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{dashboardStats.activeToday}</div>
          <div className="stat-label">Активных сегодня</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{dashboardStats.pending}</div>
          <div className="stat-label">Ожидают подтверждения</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{dashboardStats.rejected}</div>
          <div className="stat-label">Отклонено</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{dashboardStats.thisMonth}</div>
          <div className="stat-label">Всего за месяц</div>
        </div>
      </div>
      <div className="dashboard-header">
        <h3>Список бронирований</h3>
        <Link to="/bookings/new" className="button-primary">Новое бронирование</Link>
      </div>
      <div className="bookings-list">
        <table className="bookings-table">
            <thead>
                <tr>
                    <th>ID</th><th>Аудитория</th><th>Дата и время</th><th>Мероприятие</th><th>Статус</th><th>Действия</th>
                </tr>
            </thead>
            <tbody>
                {bookings.map(booking => {
                    const statusInfo = getStatusInfo(booking.status);
                    return (
                        <tr key={booking.id}>
                            <td>#{booking.id.slice(-6)}</td>
                            <td>{getRoomName(booking.resourceId, rooms)}</td>
                            <td>{formatDateTime(booking.start)}</td>
                            <td>{booking.title}</td>
                            <td><span className={`status ${statusInfo.className}`}>{statusInfo.text}</span></td>
                            <td>
                                <div className="action-buttons">
                                    <button title="Редактировать">✏️</button>
                                    <button title="Удалить">🗑️</button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>
    </div>
  );
}