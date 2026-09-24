import { LocaleLink } from "@/components/locale-link";

interface Props {
  slug: string;
  title: string;
  description?: string;
  status?: string;
}

export function ProjectCard({ slug, title, description, status }: Props) {
  return (
    <article className="project-card">
      <LocaleLink href={`/proyectos/${slug}`} className="project-card__link">
        {status ? <span className="project-card__status ds-label">{status}</span> : null}
        <h2 className="project-card__title">{title}</h2>
        {description ? <p className="project-card__desc">{description}</p> : null}
      </LocaleLink>
    </article>
  );
}
