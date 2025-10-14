import { Form, useLoaderData, redirect, useNavigate } from "react-router-dom";
import { getRooms, createBooking } from "../data";
import type { Room } from "../data";
import "./new-booking.css";

export async function loader() {
  const rooms = await getRooms();
  return { rooms };
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const bookingData = {
    title: formData.get("eventName") as string,
    resourceType: "room" as const,
    resourceId: formData.get("auditorium") as string,
    start: new Date(`${formData.get("startDate")}T${formData.get("startTime")}`).toISOString(),
    end: new Date(`${formData.get("endDate")}T${formData.get("endTime")}`).toISOString(),
    notes: formData.get("notes") as string,
    status: 'pending' as const,
  };

  await createBooking(bookingData);
  return redirect(`/`);
}

export default function NewBooking() {
  const { rooms } = useLoaderData() as { rooms: Room[] };
  const navigate = useNavigate();

  return (
    <div className="new-booking-container">
      <div className="new-booking-header">
        <button onClick={() => navigate(-1)} className="back-button">← Назад к списку</button>
        <h2>Создание нового бронирования</h2>
        <div className="header-actions">
          <button type="button" className="save-draft-button">Сохранить как черновик</button>
          <button type="submit" form="booking-form" className="button-primary">Создать бронирование</button>
        </div>
      </div>
      <Form method="post" id="booking-form">
        <div className="form-main-area">
          <div className="form-section">
            <h3>Основная информация о мероприятии</h3>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="eventName">Название мероприятия</label>
                <input type="text" id="eventName" name="eventName" placeholder="Лекция по основам нейронных сетей" required />
              </div>
              <div className="form-field">
                <label htmlFor="eventType">Тип мероприятия</label>
                <select id="eventType" name="eventType">
                  <option>Лекция</option>
                  <option>Семинар</option>
                  <option>Конференция</option>
                </select>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="description">Описание мероприятия</label>
              <textarea id="description" name="description" rows={3} placeholder="Дополнительная информация о мероприятии: цели, особенности проведения..."></textarea>
            </div>
          </div>

          <div className="form-section">
            <h3>Дата и время проведения</h3>
            <div className="form-row">
              <div className="form-field"><label htmlFor="startDate">Дата начала</label><input type="date" id="startDate" name="startDate" required /></div>
              <div className="form-field"><label htmlFor="startTime">Время начала</label><input type="time" id="startTime" name="startTime" required /></div>
              <div className="form-field"><label htmlFor="endDate">Дата окончания</label><input type="date" id="endDate" name="endDate" required /></div>
              <div className="form-field"><label htmlFor="endTime">Время окончания</label><input type="time" id="endTime" name="endTime" required /></div>
            </div>
          </div>

          <div className="form-section">
            <h3>Выбор аудитории</h3>
            <div className="form-field">
              <label htmlFor="auditorium">Выберите аудиторию</label>
              <select id="auditorium" name="auditorium" required>
                <option value="">-- Выберите аудиторию --</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name} (вместимость: {room.capacity})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Участники мероприятия</h3>
            <div className="form-row">
                <div className="form-field"><label htmlFor="organizerName">ФИО организатора</label><input type="text" id="organizerName" name="organizerName" placeholder="Иванов Иван Иванович" /></div>
                <div className="form-field"><label htmlFor="organizerPosition">Должность</label><input type="text" id="organizerPosition" name="organizerPosition" placeholder="Профессор кафедры математики" /></div>
            </div>
          </div>

          <div className="form-section">
            <h3>Оборудование и требования</h3>
            <div className="form-field">
              <label htmlFor="notes">Дополнительные требования и комментарии</label>
              <textarea id="notes" name="notes" rows={3} placeholder="Специальные требования: особая температура, освещение, доступ для инвалидов, безопасность"></textarea>
            </div>
          </div>

        </div>
        <div className="form-sidebar-area">
          <div className="status-card">
            <h4>Статус заявки</h4>
            <p className="status-new">Новая</p>
          </div>
          <div className="useful-tips">
            <h4>Полезные советы</h4>
            <ul>
                <li>Проверьте доступность аудитории на выбранное время.</li>
                <li>Убедитесь, что вместимость аудитории соответствует количеству участников.</li>
                <li>Укажите всё необходимое оборудование заранее.</li>
                <li>Для регулярных мероприятий используйте функцию серийного бронирования.</li>
            </ul>
          </div>
        </div>
      </Form>
    </div>
  );
}