import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de seguridad",
  description:
    "Política de seguridad y divulgación responsable de vulnerabilidades de alexendros.me.",
  alternates: { canonical: "/legal/seguridad" },
};

export default function SeguridadPage() {
  return (
    <>
      <h1>Política de seguridad</h1>

      <section aria-labelledby="seg-esencial">
        <h2 id="seg-esencial">Lo esencial</h2>
        <p>
          Si has encontrado una vulnerabilidad en este sitio,{" "}
          <strong>no abras un issue público</strong>. Escríbeme a{" "}
          <a href="mailto:security@alexendros.me">security@alexendros.me</a> con los detalles.
          Responderé en 72 horas hábiles y trabajaré contigo para resolverla.
        </p>
      </section>

      <section aria-labelledby="seg-reportar">
        <h2 id="seg-reportar">Cómo reportar</h2>
        <p>Incluye en tu reporte:</p>
        <ul>
          <li>Descripción del problema y posible impacto.</li>
          <li>Pasos para reproducir o prueba de concepto.</li>
          <li>Versiones afectadas.</li>
          <li>Cualquier mitigación temporal conocida.</li>
        </ul>
        <p>
          Puedes cifrar el mensaje con la clave PGP publicada en el directorio Web Key Directory:{" "}
          <code>gpg --auto-key-locate wkd --locate-key security@alexendros.me</code>
        </p>
      </section>

      <section aria-labelledby="seg-sla">
        <h2 id="seg-sla">SLA de respuesta</h2>
        <ul>
          <li>
            <strong>Acuse de recibo:</strong> 72 horas hábiles.
          </li>
          <li>
            <strong>Evaluación inicial:</strong> 7 días naturales.
          </li>
          <li>
            <strong>Resolución o plan de mitigación:</strong> 30 días naturales (90 días para
            vulnerabilidades complejas que requieran reescritura).
          </li>
        </ul>
      </section>

      <section aria-labelledby="seg-divulgacion">
        <h2 id="seg-divulgacion">Divulgación coordinada</h2>
        <p>
          Trabajamos contigo para coordinar la divulgación. Si la vulnerabilidad es explotable
          activamente publicaremos el aviso de seguridad lo antes posible sin comprometer las
          personas usuarias.
        </p>
      </section>

      <section aria-labelledby="seg-reconocimiento">
        <h2 id="seg-reconocimiento">Reconocimiento</h2>
        <p>
          Reconocemos públicamente a quienes nos ayudan a mejorar la seguridad salvo que solicitéis
          lo contrario.
        </p>
      </section>

      <section aria-labelledby="seg-normativo">
        <h2 id="seg-normativo">Marco normativo aplicable</h2>
        <p>
          Este proyecto se desarrolla y mantiene desde España. La política de divulgación
          responsable se inspira en lo previsto en el Reglamento General de Protección de Datos
          (Reglamento (UE) 2016/679, RGPD, art. 33 y 34) y en la Ley 34/2002, de 11 de julio, de
          Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE) cuando
          aplique.
        </p>
      </section>

      <section aria-labelledby="seg-contacto">
        <h2 id="seg-contacto">Contacto</h2>
        <p>
          Para consultas no urgentes y solicitudes de información sobre seguridad del proyecto:{" "}
          <a href="mailto:security@alexendros.me">security@alexendros.me</a>.
        </p>
      </section>
    </>
  );
}
