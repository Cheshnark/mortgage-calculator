// Layout raíz mínimo. El `<html>`/`<body>` reales viven en
// `[locale]/layout.tsx`; este solo existe para que `/` tenga una página
// (`page.tsx`) que redirige al idioma por defecto en el export estático,
// ya que sin middleware nadie negocia el locale.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
