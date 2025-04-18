// Define common types that can be shared across multiple components

// You can extend these types as your application grows
interface NavLinkType {
  name: string;
  href: string;
}

interface ProjectInfoType {
  name: string;
  description: string;
  github: string;
}

interface FooterLinkType {
  name: string;
  href: string;
}

export type { NavLinkType, ProjectInfoType, FooterLinkType };
