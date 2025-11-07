'use client';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button className="btn border" onClick={() => setTheme(isDark ? 'light' : 'dark')}>
      {isDark ? <Sun size={16}/> : <Moon size={16}/>} <span className="ml-1">{isDark?'라이트':'다크'}</span>
    </button>
  );
}
