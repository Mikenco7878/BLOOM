import { sectionRegistry } from './registry';

export function SectionRenderer({
  sections = [],
  media = {},
  settings = {},
  contactSuccess = false,
}) {
  const ordered = sections
    .filter((section) => section.enabled)
    .toSorted((a, b) => a.sortOrder - b.sortOrder);
  const firstHeroId = ordered.find((section) => section.type === 'hero')?.id;
  return ordered.map((section) => {
    const Component = sectionRegistry[section.type];
    return Component ? (
      <Component
        key={section.id}
        data={section.data}
        media={media}
        settings={settings}
        isPrimaryHero={section.id === firstHeroId}
        submissionSuccess={contactSuccess}
      />
    ) : null;
  });
}

export default SectionRenderer;
