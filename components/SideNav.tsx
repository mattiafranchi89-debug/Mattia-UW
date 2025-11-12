import React from 'react';

interface SideNavProps {
  sections: { id: string; title: string }[];
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const SideNav: React.FC<SideNavProps> = ({ sections, activeSection, onNavigate }) => {
  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    event.preventDefault(); // Prevent the default anchor tag navigation
    onNavigate(sectionId);
  };

  return (
    <nav className="sticky top-24">
      <h3 className="text-sm font-semibold uppercase text-gray-500 tracking-wider mb-3">Sections</h3>
      <ul className="space-y-2">
        {sections.map(section => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              onClick={(e) => handleNavClick(e, section.id)}
              className={`block text-sm font-medium transition-colors duration-200 ease-in-out border-l-2 py-1 px-3 ${
                activeSection === section.id
                  ? 'text-red-500 border-red-500'
                  : 'text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300'
              }`}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};