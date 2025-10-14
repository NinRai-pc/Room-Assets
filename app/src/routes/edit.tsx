import { useState } from "react";
import { Form, useLoaderData, redirect, useNavigate, useActionData } from "react-router-dom";
import { getRoom, updateRoom, createRoom } from "../data";
import type { Room } from "../data";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router-dom";
import "./edit.css";

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

export async function loader({ params }: LoaderFunctionArgs) {
  if (params.roomId) {
    const room = await getRoom(params.roomId);
    if (!room) throw new Response("", { status: 404, statusText: "Not Found" });
    return { room };
  }
  return { room: null };
}

async function handleFormData(formData: FormData) {
    const data = Object.fromEntries(formData);
    if (!data.name || !data.capacity || !data.location) {
        return { error: "Название, местоположение и вместимость не могут быть пустыми." };
    }

    const roomData = {
        name: data.name as string,
        location: data.location as string,
        capacity: Number(data.capacity),
        features: formData.getAll("features") as string[],
    };
    return { roomData };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const result = await handleFormData(formData);
  if ('error' in result) return result;

  await updateRoom(params.roomId!, result.roomData);
  return redirect(`/catalog`);
}

export async function actionCreate({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const result = await handleFormData(formData);
  if ('error' in result) return result;

  await createRoom(result.roomData);
  return redirect(`/catalog`);
}

export default function EditRoom() {
  const { room } = useLoaderData() as { room: Room | null };
  const actionData = useActionData() as { error?: string };
  const navigate = useNavigate();
  const isNew = room === null;

  const [features, setFeatures] = useState<string[]>(room?.features || []);
  const [customFeature, setCustomFeature] = useState('');

  const handleAddCustomFeature = () => {
    const key = customFeature.trim().toLowerCase().replace(/\s+/g, '_');
    if (key && !features.includes(key)) {
      setFeatures([...features, key]);
      if (!PREDEFINED_FEATURES[key]) {
        PREDEFINED_FEATURES[key] = customFeature.trim();
      }
    }
    setCustomFeature('');
  };

  return (
    <div className="edit-page-container">
      <h3>{isNew ? "Создание новой аудитории" : "Редактирование аудитории"}</h3>
      <Form method="post" id="room-form">
        <div className="form-field">
          <span>Название</span>
          <input placeholder="Аудитория 101" type="text" name="name" defaultValue={room?.name || ''} required/>
        </div>
        <div className="form-field">
          <span>Местоположение</span>
          <input placeholder="Главный корпус, 1 этаж" type="text" name="location" defaultValue={room?.location || ''} required/>
        </div>
        <div className="form-field">
          <span>Вместимость</span>
          <input type="number" name="capacity" placeholder="30" defaultValue={room?.capacity || ''} required/>
        </div>
        <div className="form-field">
          <span>Оборудование</span>
          <div className="features-checklist">
            {Object.entries(PREDEFINED_FEATURES).map(([key, value]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  name="features"
                  value={key}
                  checked={features.includes(key)}
                  onChange={(e) => {
                    if (e.target.checked) {
                        setFeatures([...features, key]);
                    } else {
                        setFeatures(features.filter(f => f !== key));
                    }
                  }}
                /> {value}
              </label>
            ))}
          </div>
          <div className="custom-feature-adder">
            <input 
              type="text" 
              placeholder="Добавить новое оборудование" 
              value={customFeature}
              onChange={(e) => setCustomFeature(e.target.value)}
            />
            <button type="button" onClick={handleAddCustomFeature}>Добавить</button>
          </div>
        </div>
        <div className="form-actions">
          <button type="submit">Сохранить</button>
          <button type="button" onClick={() => navigate(-1)}>Отмена</button>
        </div>
        {actionData?.error && <p className="error-message">{actionData.error}</p>}
      </Form>
    </div>
  );
}