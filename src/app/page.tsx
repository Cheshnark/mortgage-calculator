import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

// `/` no tiene contenido propio: redirige al idioma por defecto. En el export
// estático Next materializa esto como un `out/index.html` con meta-refresh más
// redirección en cliente. El servidor de ficheros puede además mandar `/` a
// `/es` con una regla propia (ver Caddyfile.example).
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
