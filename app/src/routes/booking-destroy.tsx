import { redirect } from "react-router-dom";
import type { ActionFunctionArgs } from "react-router-dom";
import { deleteBooking } from "../data";

export async function action({ params }: ActionFunctionArgs) {
  if (!params.bookingId) {
    throw new Error("Missing bookingId");
  }
  await deleteBooking(params.bookingId);
  return redirect("/");
}
