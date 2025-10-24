import React, from 'react';
import { User } from '../../types';
import { GlobeAltIcon, ArrowRightOnRectangleIcon } from '../icons/HeroIcons';
import { useLanguage } from '../../contexts/LanguageContext';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const { language, setLanguage, t, languages } = useLanguage();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-indigo-600">{t('collabzy')}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-500">
              <GlobeAltIcon className="h-6 w-6" />
              <select 
                className="bg-transparent border-none focus:ring-0"
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
              >
                {languages.map(lang => (
                  <option key={lang.key} value={lang.key}>{lang.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <img className="h-10 w-10 rounded-full object-cover" src={user.avatar} alt={user.name} />
              <div>
                <p className="font-semibold text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-500">{user.role}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-label={t('logout')}
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
