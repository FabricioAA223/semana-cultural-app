// components/Navbar.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  MdEmojiEvents as PodiumIcon,
  MdOutlineEmojiEvents as CrownOutlineIcon,
  MdEmojiEvents as CrownIcon,
  MdCalendarToday as CalendarIcon,
  MdOutlineCalendarToday as CalendarOutlineIcon
} from 'react-icons/md';

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    {
      path: '/',
      name: 'Tabla general',
      icon: (isActive: boolean) => (
        <PodiumIcon size={28} className={isActive ? 'text-blue-400' : 'text-gray-400'} />
      ),
    },
    {
      path: '/game-positions',
      name: 'Puntaje por actividad',
      icon: (isActive: boolean) => (
        isActive 
          ? <CrownIcon size={28} className="text-blue-400" /> 
          : <CrownOutlineIcon size={28} className="text-gray-400" />
      ),
    },
    {
      path: '/schedule',
      name: 'Calendario',
      icon: (isActive: boolean) => (
        isActive 
          ? <CalendarIcon size={28} className="text-blue-400" /> 
          : <CalendarOutlineIcon size={28} className="text-gray-400" />
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-zinc-700 z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link 
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center w-full h-full ${
              pathname === item.path ? 'text-blue-400' : 'text-zinc-400'
            }`}
          >
            {item.icon(pathname === item.path)}
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;