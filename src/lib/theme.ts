export const themes = {
  student: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#22D3EE',
    bg: 'bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100',
    cardBg: 'bg-white/80 backdrop-blur-sm',
    text: 'text-gray-900',
    description: 'Playful and engaging blue-purple gradient',
  },
  parent: {
    primary: '#14B8A6',
    secondary: '#F59E0B',
    accent: '#FCD34D',
    bg: 'bg-gradient-to-br from-teal-50 via-amber-50 to-teal-100',
    cardBg: 'bg-white',
    text: 'text-gray-900',
    description: 'Warm teal-amber palette for parents',
  },
  school: {
    primary: '#10B981',
    secondary: '#FACC15',
    accent: '#34D399',
    bg: 'bg-gray-50',
    cardBg: 'bg-white',
    text: 'text-gray-900',
    description: 'Professional emerald-gold theme',
  },
  admin: {
    primary: '#111827',
    secondary: '#F59E0B',
    accent: '#FB923C',
    bg: 'bg-gray-900',
    cardBg: 'bg-gray-800',
    text: 'text-gray-100',
    description: 'Dark data-dense admin interface',
  },
};

export type Role = keyof typeof themes;

export function getTheme(role: Role) {
  return themes[role];
}

export function getThemeClasses(role: Role) {
  const theme = themes[role];
  return {
    bgClass: theme.bg,
    cardClass: theme.cardBg,
    textClass: theme.text,
  };
}
