import React, { useState, useMemo } from "react";
import { useLoaderData, Form, Link, redirect, useSearchParams, useSubmit } from "react-router-dom";
import { getRooms, getAllData, setItems, updateRoom } from "../data";
import type { Room, Booking, Asset } from "../data";
import './catalog.css';

const PREDEFINED_FEATURES: { [key: string]: string } = {
    projector: 'Проектор',
    whiteboard: 'Интерактивная доска',
    microphone: 'Микрофон',
    sound_system: 'Звуковая система',
    computer: 'Компьютер',
    wifi: 'Wi-Fi',
    conditioner: 'Кондиционер',
    videocall: 'Видеосвязь',
};
const allFeatures = Object.keys(PREDEFINED_FEATURES);

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const features = url.searchParams.getAll("features");
  const rooms = await getRooms(q, features);
  const { bookings, assets } = await getAllData();
  return { rooms, bookings, assets, q, features };
}

export async function actionMassUpdate({ request }: { request: Request }) {
    const formData = await request.formData();
    const updates = JSON.parse(formData.get("updates") as string);
    
    let rooms = await getRooms();
    for (const roomId in updates) {
        let room = rooms.find(r => r.id === roomId);
        if (room) {
            Object.assign(room, updates[roomId]);
        }
    }
    await setItems('rooms', rooms);
    return { ok: true };
}

export default function Catalog() {
  const { rooms, bookings, assets, q, features: activeFeatures } = useLoaderData() as { rooms: Room[], bookings: Booking[], assets: Asset[], q: string, features: string[] };
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();

  const [isMassEditing, setIsMassEditing] = useState(false);
  const [editedRooms, setEditedRooms] = useState<{ [id: string]: Partial<Room> }>({});

  const handleEditChange = (roomId: string, field: keyof Room, value: string | number) => {
    setEditedRooms(prev => ({ ...prev, [roomId]: { ...prev[roomId], [field]: value } }));
  };
  
  const equipmentOverview = useMemo(() => {
    const counts: { [key: string]: number } = {};
    rooms.forEach(room => room.features.forEach(feature => { counts[feature] = (counts[feature] || 0) + 1; }));
    return counts;
  }, [rooms]);
  
  const buildingLayout = useMemo(() => {
    const layout: { [floor: string]: Room[] } = {};
    rooms.forEach(room => {
        const match = room.name.match(/\d+/);
        if (match) {
            const floor = Math.floor(parseInt(match[0], 10) / 100);
            if (floor > 0) {
                if (!layout[floor]) layout[floor] = [];
                layout[floor].push(room);
            }
        }
    });
    return Object.entries(layout).sort(([a], [b]) => Number(b) - Number(a));
  }, [rooms]);

  const handleFeatureToggle = (feature: string) => {
    const newFeatures = new Set(activeFeatures);
    newFeatures.has(feature) ? newFeatures.delete(feature) : newFeatures.add(feature);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('features');
    newFeatures.forEach(f => newParams.append('features', f));
    setSearchParams(newParams);
  }

  const handleExport = async () => {
    const data = await getAllData();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "room_booking_data.json";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!confirm("Вы уверены? Это перезапишет все существующие данные.")) { event.target.value = ''; return; }
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target?.result as string);
            if (data.rooms && data.bookings && data.assets) {
                await setItems('rooms', data.rooms);
                await setItems('bookings', data.bookings);
                await setItems('assets', data.assets);
                alert("Данные успешно импортированы!"); window.location.reload();
            } else { alert("Неверный формат файла."); }
        } catch (error) { alert("Ошибка при чтении файла."); }
    };
    reader.readAsText(file);
  };

  const isRoomBookedNow = (roomId: string) => {
    const now = new Date();
    return bookings.some(b => b.resourceId === roomId && now >= new Date(b.start) && now <= new Date(b.end));
  };

  return (
    <div className="catalog-page-container">
        <div className="stats-cards">
            <div className="stat-card"><div className="stat-value">{rooms.length}</div><div className="stat-label">Всего аудиторий</div></div>
            <div className="stat-card"><div className="stat-value">{rooms.filter(r => !isRoomBookedNow(r.id)).length}</div><div className="stat-label">Доступные сейчас</div></div>
            <div className="stat-card"><div className="stat-value">{rooms.filter(r => isRoomBookedNow(r.id)).length}</div><div className="stat-label">Забронированы</div></div>
            <div className="stat-card"><div className="stat-value">{assets.length}</div><div className="stat-label">Единиц оборудования</div></div>
        </div>
      <div className="main-content-area">
        <div className="catalog-container">
            <div className="catalog-header">
                <h3>Список аудиторий</h3>
                <div className="header-actions">
                    <button onClick={handleExport}>Экспорт JSON</button>
                    <label className="import-button">Импорт JSON<input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} /></label>
                    <Link to="/catalog/new" className="button-primary">Добавить аудиторию</Link>
                </div>
            </div>
            <Form role="search" className="filters-and-search">
                <input type="search" name="q" placeholder="Поиск по названию, номеру или местоположению..." defaultValue={q || ''} onChange={(e) => submit(e.currentTarget.form)} />
                <div className="filter-buttons">
                    {allFeatures.map(key => (
                        <button key={key} type="button" className={`filter-button ${activeFeatures.includes(key) ? 'active' : ''}`} onClick={() => handleFeatureToggle(key)}>{PREDEFINED_FEATURES[key] || key}</button>
                    ))}
                </div>
            </Form>
          
          <Form method="post">
            <table className="catalog-table">
              <thead><tr><th>Номер</th><th>Название</th><th>Местоположение</th><th>Вместимость</th><th>Оборудование</th><th>Статус</th><th>Действия</th></tr></thead>
              <tbody>
                {rooms.map((room) => {
                  const currentData = { ...room, ...editedRooms[room.id] };
                  return isMassEditing ? (
                    <tr key={room.id} className="editable-row">
                      <td>{currentData.name.match(/\d+/)?.[0] || 'N/A'}</td>
                      <td><input type="text" value={currentData.name} onChange={(e) => handleEditChange(room.id, 'name', e.target.value)} /></td>
                      <td><input type="text" value={currentData.location} onChange={(e) => handleEditChange(room.id, 'location', e.target.value)} /></td>
                      <td><input type="number" value={currentData.capacity} onChange={(e) => handleEditChange(room.id, 'capacity', Number(e.target.value))} /></td>
                      <td>-</td><td>-</td><td>-</td>
                    </tr>
                  ) : (
                    <tr key={room.id}>
                      <td>{room.name.match(/\d+/)?.[0] || 'N/A'}</td>
                      <td>{room.name}</td>
                      <td>{room.location}</td>
                      <td>{room.capacity}</td>
                      <td><div className="features-list">{room.features.map(key => <span key={key} className="feature-tag">{PREDEFINED_FEATURES[key] || key}</span>)}</div></td>
                      <td><span className={`status ${isRoomBookedNow(room.id) ? 'status-rejected' : 'status-confirmed'}`}>{isRoomBookedNow(room.id) ? 'Занята' : 'Свободна'}</span></td>
                      <td>
                        <div className="action-buttons">
                          <Link to={`/catalog/${room.id}/edit`} title="Редактировать">✏️</Link>
                          <Form method="post" action={`/catalog/${room.id}/destroy`} onSubmit={(e) => !confirm("Подтвердите удаление") && e.preventDefault()}><button type="submit" title="Удалить">🗑️</button></Form>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {isMassEditing && (
              <div className="mass-edit-actions">
                  <input type="hidden" name="updates" value={JSON.stringify(editedRooms)} />
                  <button type="submit" className="button-primary">Сохранить все</button>
                  <button type="button" onClick={() => { setIsMassEditing(false); setEditedRooms({}); }}>Отмена</button>
              </div>
            )}
          </Form>

        </div>
        <div className="sidebar-area">
          <div className="widget">
            <h4>Быстрые действия</h4>
            <div className="quick-actions">
                <Link to="/catalog/new"><button>Добавить аудиторию</button></Link>
                <Link to="/bookings/new"><button>Создать бронирование</button></Link>
                <button onClick={() => setIsMassEditing(prev => !prev)}>{isMassEditing ? 'Отменить редактирование' : 'Массовое редактирование'}</button>
            </div>
          </div>
        </div>
      </div>
      <div className="bottom-widgets-area">
          <div className="widget">
              <h4>Обзор оборудования</h4>
              <div className="equipment-overview">
                  {Object.entries(equipmentOverview).map(([key, count]) => <div key={key}><span>{count}</span> {PREDEFINED_FEATURES[key] || key}</div>)}
              </div>
          </div>
          <div className="widget">
              <h4>Схема корпуса</h4>
              <div className="building-layout">
                  {buildingLayout.map(([floor, floorRooms]) => (
                      <div key={floor} className="floor-row">
                          <span>{floor} этаж</span>
                          <div>{floorRooms.map(r => <div key={r.id} className={`room-block ${isRoomBookedNow(r.id) ? 'unavailable' : 'available'}`} title={r.name}>{r.name.match(/\d+/)?.[0]}</div>)}</div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
}