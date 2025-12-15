'use client'

import { useState } from 'react'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface LanguageSelectorProps {
  currentLanguage?: string
  onLanguageChange?: (language: string) => void
  className?: string
}

const languages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
]

export function LanguageSelector({ 
  currentLanguage = 'es', 
  onLanguageChange,
  className = '' 
}: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage)

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode)
    if (onLanguageChange) {
      onLanguageChange(languageCode)
    }
    // También guardarlo en localStorage para persistencia
    localStorage.setItem('flowy-language', languageCode)
    // Recargar la página para aplicar el idioma
    window.location.reload()
  }

  const currentLang = languages.find(lang => lang.code === selectedLanguage)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className={`${className} hover:bg-gray-100`}
        >
          <Globe className="h-4 w-4 mr-1" />
          <span className="text-sm">{currentLang?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="cursor-pointer"
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}