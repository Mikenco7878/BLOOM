export default function SectionIntro({ eyebrow, heading, description }) {
  return (
    <div className="section-intro">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      {heading && <h2>{heading}</h2>}
      {description && <p>{description}</p>}
    </div>
  );
}
