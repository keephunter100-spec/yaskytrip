import React from 'react';
import { X, Check } from 'lucide-react';

export interface Language {
  code: string;
  name: string;
  flag: string;
  isRtl?: boolean;
}

export const LANGUAGES: Language[] = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇲🇳' }, // wait, Indonesia flag is 🇮🇩
  { code: 'ms', name: 'Bahasa Malaysia', flag: '🇲🇾' },
  { code: 'ca', name: 'Català', flag: '🇪🇸' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'et', name: 'Eesti', flag: '🇪🇪' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'es-AR', name: 'Español (AR)', flag: '🇦🇷' },
  { code: 'es-MX', name: 'Español (MX)', flag: '🇲🇽' },
  { code: 'fil', name: 'Filipino', flag: '🇵🇭' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'lv', name: 'Latviski', flag: '🇱🇻' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Português (PT)', flag: '🇵🇹' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenščina', flag: '🇸🇮' },
  { code: 'sr', name: 'Srpski', flag: '🇷🇸' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'is', name: 'Íslenska', flag: '🇮🇸' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'he', name: 'עברית', flag: '🇮🇱', isRtl: true },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', isRtl: true },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th', name: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' }
];

// Fix Indonesia flag (was 🇲🇳 Mongolia instead of 🇮🇩 Indonesia)
LANGUAGES[1].flag = '🇮🇩';

interface LanguageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguageCode: string;
  onSelectLanguage: (code: string) => void;
  language: string; // current active translation lang
}

export default function LanguageSelectionModal({
  isOpen,
  onClose,
  selectedLanguageCode,
  onSelectLanguage,
  language,
}: LanguageSelectionModalProps) {
  if (!isOpen) return null;

  // Title translation based on language
  const getTitle = () => {
    if (selectedLanguageCode === 'ko') return '언어 선택';
    if (selectedLanguageCode === 'ja') return '言語の選択';
    if (selectedLanguageCode.startsWith('zh')) return '选择语言';
    if (selectedLanguageCode === 'fr') return 'Choisir la langue';
    if (selectedLanguageCode === 'de') return 'Sprache auswählen';
    if (selectedLanguageCode === 'es' || selectedLanguageCode.startsWith('es-')) return 'Seleccionar idioma';
    return 'Select Language';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="language-modal-container">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        id="language-modal-card"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center space-x-2">
            <span>{getTitle()}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            id="close-language-modal-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Language Grid */}
        <div className="p-6 overflow-y-auto" id="language-grid-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === selectedLanguageCode;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    onSelectLanguage(lang.code);
                    onClose();
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 text-blue-600 shadow-xs border border-blue-100/50'
                      : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-transparent'
                  }`}
                  id={`lang-item-${lang.code}`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="text-xl select-none leading-none shrink-0">{lang.flag}</span>
                    <span className="truncate">{lang.name}</span>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-blue-600 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
