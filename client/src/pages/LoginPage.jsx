import { useSearchParams } from "react-router-dom";
import { AuthForm } from "../ui/AuthForm.jsx";

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const showConfirmEmailMessage = searchParams.get("mensaje") === "confirma-email";

  return (
    <main className="center-page">
      <div className="auth-stack">
        {showConfirmEmailMessage ? (
          <div className="alert warning">
            Cuenta creada. Confirma tu email para ingresar, o desactiva la confirmacion por correo en Supabase mientras pruebas.
          </div>
        ) : null}
        <AuthForm mode="login" />
      </div>
    </main>
  );
}
