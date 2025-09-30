import { Form, useLoaderData, redirect, useNavigate } from "react-router-dom";
import { getRoom, updateRoom } from "../data";
import type { Room } from "../data";
import type { LoaderFunctionArgs } from "react-router-dom";
import "./edit.css";

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.roomId) {
    throw new Response("", { status: 404, statusText: "Not Found" });
  }
  const room = await getRoom(params.roomId);
  if (!room) {
    throw new Response("", { status: 404, statusText: "Not Found" });
  }
  return { room };
}

export async function action({ request, params }: LoaderFunctionArgs) {
  if (!params.roomId) {
    throw new Error("Room ID is missing");
  }
  const formData = await request.formData();
  const formUpdates = Object.fromEntries(formData);
  
  const updates: Partial<Room> = {
    ...formUpdates,
    capacity: Number(formUpdates.capacity) || 0,
    features: typeof formUpdates.features === 'string' 
                ? formUpdates.features.split(',').map(f => f.trim()) 
                : [],
  };

  await updateRoom(params.roomId, updates);
  return redirect(`/catalog`); 
}

export default function EditRoom() {
  const { room } = useLoaderData() as { room: Room };
  const navigate = useNavigate();

  return (
    <Form method="post" id="room-form">
      <p>
        <span>Название</span>
        <input
          placeholder="Аудитория 101"
          aria-label="Room name"
          type="text"
          name="name"
          defaultValue={room.name}
        />
      </p>
      <label>
        <span>Вместимость</span>
        <input
          type="number"
          name="capacity"
          placeholder="30"
          defaultValue={room.capacity}
        />
      </label>
      <label>
        <span>Оборудование (через запятую)</span>
        <textarea
          name="features"
          defaultValue={room.features.join(", ")}
          rows={3}
        />
      </label>
      <p>
        <button type="submit">Сохранить</button>
        <button 
          type="button"
          onClick={() => {
            navigate(-1);
          }}
        >
          Отмена
        </button>
      </p>
    </Form>
  );
}