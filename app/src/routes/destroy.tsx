import { redirect } from "react-router-dom";
import type { ActionFunctionArgs } from "react-router-dom";
import { deleteRoom } from "../data";

export async function action({ params }: ActionFunctionArgs) {
  if (!params.roomId) {
    throw new Error("Missing roomId");
  }
  await deleteRoom(params.roomId);
  return redirect("/catalog");
}