import { useState, useMemo } from "react";
import { Form, useLoaderData, redirect, useNavigate } from "react-router-dom";
import { getBooking, getRooms, getBookings, updateBooking } from "../data";
import type { Booking, Room } from "../data";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router-dom";
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

export async function loader({ params }: LoaderFunctionArgs) {
  const booking = await getBooking(params.bookingId!);
  if (!booking) throw new Response("", { status: 404, statusText: "Not Found" });
  const rooms = await getRooms();
  const bookings = await getBookings();
  return { booking, rooms, bookings };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  if (!formData.get("resourceId")) {
    return { error: "Пожалуйста, выберите аудиторию." };
  }
  
  const bookingData = {
    title: formData.get("eventName") as string,
    resourceId: formData.get("resourceId") as string,
    start: new Date(`${formData.get("startDate")}T${formData.get("startTime")}`).toISOString(),
    end: new Date(`${formData.get("endDate")}T${formData.get("endTime")}`).toISOString(),
    notes: formData.get("notes") as string,
  };

  await updateBooking(params.bookingId!, bookingData);
  return redirect(`/`);
}

function checkAvailability(room: Room, formStart: Date, formEnd: Date, allBookings: Booking[], excludeBookingId?: string) {
    if (!formStart.valueOf() || !formEnd.valueOf() || formEnd <= formStart) {
        return { status: 'invalid_time', text: 'Неверное время' };
    }
    
    const roomBookings = allBookings.filter(b => b.resourceId === room.id && b.id !== excludeBookingId);
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

export default function EditBooking() {
  const { booking, rooms, bookings } = useLoaderData() as { booking: Booking, rooms: Room[], bookings: Booking[] };
  const navigate = useNavigate();

  const startDateTime = new Date(booking.start);
  const endDateTime = new Date(booking.end);

  const [startDate, setStartDate] = useState(startDateTime.toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(startDateTime.toTimeString().slice(0, 5));
  const [endDate, setEndDate] = useState(endDateTime.toISOString().split('T')[0]);
  const [endTime, setEndTime] = useState(endDateTime.toTimeString().slice(0, 5));
  const [capacityFilter, setCapacityFilter] = useState('');
  const [featuresFilter, setFeaturesFilter] = useState<string[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(booking.resourceId);

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

  const selectedRoom = useMemo(() => selectedRoomId ? rooms.find(r => r.id === selectedRoomId) : null, [selectedRoomId, rooms]);

  return (
    <div className="new-booking-container">
      <div className="new-booking-header">
          <button type="button" onClick={() => navigate(-1)} className="back-button">← Назад к списку</button>
          <h2>Редактирование бронирования</h2>
      </div>
      
      <Form method="post" id="booking-form">
        <div className="form-and-list-layout">
          <div className="form-main-area">
            <div className="form-section">
                <h3>Основная информация</h3>
                <div className="form-field"><label htmlFor="eventName">Название мероприятия</label><input type="text" id="eventName" name="eventName" defaultValue={booking.title} required /></div>
                <div className="form-row">
                    <div className="form-field"><label htmlFor="startDate">Дата начала</label><input type="date" id="startDate" name="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required /></div>
                    <div className="form-field"><label htmlFor="startTime">Время начала</label><input type="time" id="startTime" name="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} required /></div>
                    <div className="form-field"><label htmlFor="endDate">Дата окончания</label><input type="date" id="endDate" name="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} required /></div>
                    <div className="form-field"><label htmlFor="endTime">Время окончания</label><input type="time" id="endTime" name="endTime" value={endTime} onChange={e => setEndTime(e.target.value)} required /></div>
                </div>
                <div className="form-field"><label htmlFor="notes">Примечания</label><textarea id="notes" name="notes" defaultValue={booking.notes || ''} placeholder="Дополнительная информация о бронировании..." /></div>
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
                const availability = checkAvailability(room, formStartTime, formEndTime, bookings, booking.id);
                const isDisabled = availability.status === 'invalid_time' || availability.status === 'conflict';
                return (
                  <label key={room.id} className={`room-card ${isDisabled ? 'disabled' : ''} status-bg-${availability.status}`}>
                    <input type="radio" name="resourceId" value={room.id} checked={selectedRoomId === room.id} disabled={isDisabled} onChange={() => setSelectedRoomId(room.id)} />
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

        {selectedRoom && (
          <div className="selected-room-details">
            <h3>Выбранная аудитория</h3>
            <div className="room-details-card">
              <div className="detail-row">
                <span className="detail-label">Название:</span>
                <span className="detail-value">{selectedRoom.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Местоположение:</span>
                <span className="detail-value">{selectedRoom.location}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Вместимость:</span>
                <span className="detail-value">{selectedRoom.capacity} человек</span>
              </div>
              {selectedRoom.features.length > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Оборудование:</span>
                  <div className="features-list-details">
                    {selectedRoom.features.map(f => (
                      <span key={f} className="feature-tag">{ALL_FEATURES[f] || f}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Статус в выбранное время:</span>
                <span className={`detail-status status-text-${checkAvailability(selectedRoom, formStartTime, formEndTime, bookings, booking.id).status}`}>
                  {checkAvailability(selectedRoom, formStartTime, formEndTime, bookings, booking.id).text}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions-footer">
          <button type="button" className="save-draft-button" onClick={() => navigate(-1)}>Отмена</button>
          <button type="submit" className="button-primary">Сохранить изменения</button>
        </div>
      </Form>
    </div>
  );
}
