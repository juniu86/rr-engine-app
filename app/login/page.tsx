import { redirect } from "next/navigation";

// /login é redirect para /sign-in (rota oficial do Clerk)
export default function Login() {
  redirect("/sign-in");
}
