import { useLoaderData, Form, redirect, Link } from "react-router-dom";
import { getRooms, createRoom } from "../data";
import type { Room } from "../data";
import './catalog.css';

// fetch data
export async function loader() {
  const rooms = await getRooms();
  return { rooms };
}

// create a new room
export async function action() {
  const room = await createRoom();
  return redirect(`/catalog/${room.id}/edit`);
}

export default function Catalog() {
  const { rooms } = useLoaderData() as { rooms: Room[] };

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h2>Каталог аудиторий</h2>
        <div>
          <button type="button">Экспорт JSON</button>
          <button type="button">Импорт JSON</button>
          <Form method="post">
             <button type="submit" className="button-primary">Добавить аудиторию</button>
          </Form>
        </div>
      </div>

      <div className="filters-and-search">
        <input type="search" name="q" placeholder="Поиск по номеру или названию..." />
      </div>

      <table className="catalog-table">
        <thead>
          <tr>
            <th>Номер</th>
            <th>Название</th>
            <th>Местоположение</th>
            <th>Вместимость</th>
            <th>Оборудование</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {rooms.length ? (
            rooms.map((room) => (
              <tr key={room.id}>
                <td>{room.name.split(' ')[1]}</td>
                <td>{room.name}</td>
                <td>Главный корпус, 1 этаж</td>
                <td>{room.capacity}</td>
                <td>
                  <div className="features-list">
                    {room.features.join(', ')}
                  </div>
                </td>
                <td>
                  <span className="status status-available">Доступна</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <Link to={`${room.id}/edit`} title="Редактировать">✏️</Link>
                    <Form
                      method="post"
                      action={`${room.id}/destroy`}
                      onSubmit={(event) => {
                        if (
                          !confirm(
                            "Пожалуйста, подтвердите удаление этой записи."
                          )
                        ) {
                          event.preventDefault();
                        }
                      }}
                    >
                      <button type="submit" title="Удалить">🗑️</button>
                    </Form>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7}>
                <p><i>Нет аудиторий</i></p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="pagination">
        <span>Показано {rooms.length} из {rooms.length}</span>
      </div>
    </div>
  );
}