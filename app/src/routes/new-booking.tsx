import React, { useState, useMemo } from "react";
import { Form, useLoaderData, redirect, useNavigate } from "react-router-dom";
import { getRooms, getBookings, createBooking } from "../data";
import type { Room, Booking } from "../data";
import "./new-booking.css";

const ALL_FEATURES: { [key: string]: string } = {
    projector: 'Проектор',
    whiteboard: 'Интерактивная доска',
    microphone: 'Микрофон',
    sound_system: 'Звуковая система',
    computer: 'Компьютер',
    wifi: 'Wi-Fi',
    conditioner: 'Кондиционер',
    videocall: 'Видеосвязь',
};

export async function loader() {
  const rooms = await getRooms();
  const bookings = await getBookings();
  return { rooms, bookings };
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  if (!formData.get("resourceId")) {
    return { error: "Пожалуйста, выберите аудиторию." };
  }
  
  const bookingData = {
    title: formData.get("eventName") as string,
    resourceType: "room" as const,
    resourceId: formData.get("resourceId") as string,
    start: new Date(`${formData.get("startDate")}T${formData.get("startTime")}`).toISOString(),
    end: new Date(`${formData.get("endDate")}T${formData.get("endTime")}`).toISOString(),
    notes: formData.get("notes") as string,
  };

  await createBooking(bookingData);
  return redirect(`/`);
}

function checkAvailability(room: Room, formStart: Date, formEnd: Date, allBookings: Booking[]) {
    if (!formStart.valueOf() || !formEnd.valueOf() || formEnd <= formStart) {
        return { status: 'invalid_time', text: 'Неверное время' };
    }
    
    const roomBookings = allBookings.filter(b => b.resourceId === room.id);
    const hasConflict = roomBookings.some(booking => {
        const bookingStart = new Date(booking.start);
        const bookingEnd = new Date(booking.end);
        return formStart < bookingEnd && formEnd > bookingStart;
    });

    if (hasConflict) {
        return { status: 'conflict', text: 'Занята в это время' };
    }
    
    return { status: 'available', text: 'Свободна' };
}

export default function NewBooking() {
  const { rooms, bookings } = useLoaderData() as { rooms: Room[], bookings: Booking[] };
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00'); // Default 24-hour time
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [endTime, setEndTime] = useState('10:00');   // Default 24-hour time
  const [capacityFilter, setCapacityFilter] = useState('');
  const [featuresFilter, setFeaturesFilter] = useState<string[]>([]);

  const formStartTime = useMemo(() => new Date(`${startDate}T${startTime}`), [startDate, startTime]);
  const formEndTime = useMemo(() => new Date(`${endDate}T${endTime}`), [endDate, endTime]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
        const capacity = parseInt(capacityFilter, 10);
        if (capacity > 0 && room.capacity < capacity) {
            return false;
        }
        if (featuresFilter.length > 0 && !featuresFilter.every(feature => room.features.includes(feature))) {
            return false;
        }
        return true;
    });
  }, [rooms, capacityFilter, featuresFilter]);
  
  const handleFeatureChange = (feature: string) => {
    setFeaturesFilter(prev => 
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    );
  };

  return (
    <div className="new-booking-container">
      <Form method="post" id="booking-form">
        <div className="form-and-list-layout">
          <div className="form-main-area">
            <div className="new-booking-header">
                <button type="button" onClick={() => navigate(-1)} className="back-button">← Назад к списку</button>
                <h2>Создание нового бронирования</h2>
            </div>

            <div className="form-section">
                <h3>Основная информация</h3>
                <div className="form-field"><label htmlFor="eventName">Название мероприятия</label><input type="text" id="eventName" name="eventName" required /></div>
                <div className="form-row">
                    <div className="form-field"><label htmlFor="startDate">Дата начала</label><input type="date" id="startDate" name="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required /></div>
                    <div className="form-field"><label htmlFor="startTime">Время начала</label><input type="time" id="startTime" name="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} required /></div>
                    <div className="form-field"><label htmlFor="endDate">Дата окончания</label><input type="date" id="endDate" name="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} required /></div>
                    <div className="form-field"><label htmlFor="endTime">Время окончания</label><input type="time" id="endTime" name="endTime" value={endTime} onChange={e => setEndTime(e.target.value)} required /></div>
                </div>
            </div>

            <div className="form-section">
                <h3>Фильтры для аудиторий</h3>
                <div className="form-field">
                    <label htmlFor="capacity">Минимальная вместимость</label>
                    <input type="number" id="capacity" name="capacity" placeholder="Например: 25" value={capacityFilter} onChange={e => setCapacityFilter(e.target.value)} />
                </div>
                <div className="form-field">
                    <label>Требуемое оборудование</label>
                    <div className="features-checklist">
                        {Object.entries(ALL_FEATURES).map(([key, value]) => (
                            <label key={key}><input type="checkbox" checked={featuresFilter.includes(key)} onChange={() => handleFeatureChange(key)} /> {value}</label>
                        ))}
                    </div>
                </div>
            </div>
          </div>
          
          <div className="room-selection-area">
            <h3>Выберите аудиторию ({filteredRooms.length})</h3>
            <div className="room-list">
              {filteredRooms.length > 0 ? filteredRooms.map(room => {
                const availability = checkAvailability(room, formStartTime, formEndTime, bookings);
                const isDisabled = availability.status === 'invalid_time' || availability.status === 'conflict';
                return (
                  <label key={room.id} className={`room-card ${isDisabled ? 'disabled' : ''} status-bg-${availability.status}`}>
                    <input type="radio" name="resourceId" value={room.id} disabled={isDisabled} />
                    <div className="room-card-info">
                      <strong>{room.name}</strong>
                      <span>Вместимость: {room.capacity}</span>
                      <div className="features-list-inline">{room.features.map(f => <span key={f} className="feature-tag-small">{ALL_FEATURES[f] || f}</span>)}</div>
                    </div>
                    <div className={`status-badge status-text-${availability.status}`}>{availability.text}</div>
                  </label>
                )
              }) : <p className="no-rooms-message">Нет аудиторий, соответствующих вашим фильтрам.</p>}
            </div>
          </div>
        </div>

        <div className="form-actions-footer">
          <button type="button" className="save-draft-button">Сохранить как черновик</button>
          <button type="submit" className="button-primary">Создать бронирование</button>
        </div>
      </Form>
    </div>
  );
}