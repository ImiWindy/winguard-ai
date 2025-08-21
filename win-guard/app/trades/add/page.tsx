import { redirect } from "next/navigation";

export default function LegacyAddTradeRedirect() {
  redirect("/trades/new");
}


