import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Preferences } from '@capacitor/preferences';
import { FormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TranslateModule],
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  isDarkMode = false;
  selectedLanguage: string = 'en';
  languages = [
    { code: 'en', label: 'English' },
    { code: 'cs', label: 'Čeština' }
  ];

  constructor(private translate: TranslateService) {}

  async ngOnInit() {
    const { value } = await Preferences.get({ key: 'isDarkMode' });
    if (value !== null) {
      this.isDarkMode = value === 'true';
    } else {
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    const lang = await Preferences.get({ key: 'selectedLanguage' });
    if (lang.value) {
      this.selectedLanguage = lang.value;
      this.translate.use(this.selectedLanguage);
    } else {
      this.translate.setDefaultLang('en');
      this.translate.use('en');
    }
  }

  async toggleDarkMode(event: any) {
    const isChecked = event.detail.checked;
    this.isDarkMode = isChecked;

    await Preferences.set({
      key: 'isDarkMode',
      value: this.isDarkMode.toString(),
    });

    if (this.isDarkMode) {
      document.documentElement.classList.add('ion-palette-dark');
    } else {
      document.documentElement.classList.remove('ion-palette-dark');
    }
  }

  async changeLanguage(lang: string) {
    this.selectedLanguage = lang;
    this.translate.use(lang);
    await Preferences.set({ key: 'selectedLanguage', value: lang });
  }
}
