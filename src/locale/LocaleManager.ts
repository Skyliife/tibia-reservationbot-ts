import * as fs from 'fs';
import logger from "../logging/logger";
import * as path from "path";

type TranslationMap = { [key: string]: string };

type LanguageMap = { [language: string]: TranslationMap };

class LocaleManager {
    private static defaultLanguage: string = 'en-US';
    private static currentLanguage: string = LocaleManager.defaultLanguage;
    private static translations: LanguageMap = {};
    private static defaultTranslation: LanguageMap = {};

    static loadLanguage(language: string): void {
        try {
            const filePath: string = path.join(__dirname, `./locales/${language}.json`);
            const data: string = fs.readFileSync(filePath, 'utf8');
            this.translations[language] = JSON.parse(data);
            this.currentLanguage = language;

            const filePathDefault: string = path.join(__dirname, `./locales/${(LocaleManager.defaultLanguage)}.json`);
            const dataDefault: string = fs.readFileSync(filePathDefault, 'utf8');
            this.defaultTranslation[(LocaleManager.defaultLanguage)] = JSON.parse(dataDefault);

        } catch (error: any) {
            logger.error(`Error loading language file for ${language}: ${error.message} using default language ${this.defaultLanguage} instead.`);

        }
    }

    static setDefaultLanguage(language: string): void {
        this.defaultLanguage = language;
    }

    static translate(key: string, variables: Record<string, string> = {}): string {
        const selectedLanguage: TranslationMap = this.translations[this.currentLanguage] || this.translations[this.defaultLanguage] || {};
        const keys = key.split('.');
        let translation: any = selectedLanguage;

        // Access each part of the key
        for (const k of keys) {
            if (translation && typeof translation === 'object' && k in translation) {
                translation = translation[k];
            } else {
                // Key or nested key not found
                translation = "undefined";
                break;
            }
        }

        // If translation is still undefined, use the original key
        translation = translation !== undefined ? translation : key;

        // Replace variables in the translation
        Object.keys(variables).forEach(variable => {
            //console.log('Replacing', `{${variable}}`, 'with', variables[variable]);
            translation = translation.split(`{${variable}}`).join(variables[variable]);
        });

        return translation;
    }

    static printInDefaultLanguage(key: string, variables: Record<string, string> = {}): string {
        const defaultLanguageTranslations: TranslationMap = this.defaultTranslation[this.defaultLanguage] || {};
        const keys = key.split('.');
        let translation: any = defaultLanguageTranslations;

        // Access each part of the key
        for (const k of keys) {
            if (translation && typeof translation === 'object' && k in translation) {
                translation = translation[k];
            } else {
                // Key or nested key not found
                translation = "undefined";
                break;
            }
        }

        // If translation is still undefined, use the original key
        translation = translation !== undefined ? translation : key;

        // Replace variables in the translation
        Object.keys(variables).forEach(variable => {
            //console.log('Replacing', `{${variable}}`, 'with', variables[variable]);
            translation = translation.split(`{${variable}}`).join(variables[variable]);
        });
        return translation;
    }
}

export default LocaleManager;