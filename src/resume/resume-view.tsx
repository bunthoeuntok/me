import type { ReactNode } from "react";
import { profile } from "../content";

export function ResumeView() {
  const { name, title, summary, jobs, projects, skills, education, certificates, languages, contacts } =
    profile;

  return (
    <main className="resume">
      <nav className="resume-toolbar" aria-label="Résumé actions">
        <a href={import.meta.env.BASE_URL}>← Back to the game</a>
        <a
          className="resume-download"
          href={`${import.meta.env.BASE_URL}resume.pdf`}
          download={`${name.replace(/\s+/g, "-")}-Resume.pdf`}
        >
          Download PDF
        </a>
      </nav>

      <header className="resume-header">
        <h1>{name}</h1>
        <p className="resume-title">{title}</p>
        <p>{summary}</p>
      </header>

      <Section title="Experience">
        {jobs.map((job) => (
          <article key={`${job.company}-${job.period}`}>
            <h3>{job.company}</h3>
            <p className="resume-meta">
              {job.role} · {job.period}
            </p>
            {job.highlights.length > 0 ? (
              <ul>
                {job.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            ) : (
              <p>{job.summary}</p>
            )}
          </article>
        ))}
      </Section>

      <Section title="Projects">
        {projects.map((project) => (
          <article key={project.title}>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <p className="resume-links">
              <a href={project.githubUrl}>Source on GitHub</a>
              {project.liveUrl && <a href={project.liveUrl}>Live site</a>}
            </p>
          </article>
        ))}
      </Section>

      <Section title="Skills">
        <ul className="resume-skills">
          {skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </Section>

      {education.length > 0 && (
        <Section title="Education">
          <ul>
            {education.map((entry) => (
              <li key={entry.school}>
                {entry.qualification}, {entry.school} · {entry.period}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {certificates.length > 0 && (
        <Section title="Certificates">
          <ul>
            {certificates.map((cert) => (
              <li key={cert.name}>
                {cert.name}, {cert.issuer} · {cert.year}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {languages.length > 0 && (
        <Section title="Languages">
          <ul>
            {languages.map((language) => (
              <li key={language.name}>
                {language.name}: {language.level}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Contact">
        <ul className="resume-contacts">
          <li>
            <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
          </li>
          <li>
            <a href={`tel:${contacts.phone.replace(/[^\d+]/g, "")}`}>{contacts.phone}</a>
          </li>
          <li>
            <a href={contacts.githubUrl}>{withoutProtocol(contacts.githubUrl)}</a>
          </li>
          <li>
            <a href={contacts.linkedinUrl}>{withoutProtocol(contacts.linkedinUrl)}</a>
          </li>
        </ul>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = `section-${title.toLowerCase()}`;
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  );
}

function withoutProtocol(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, "");
}
