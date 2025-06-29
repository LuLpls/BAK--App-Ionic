import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterOutlet } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonicModule, RouterOutlet, CommonModule],
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private translate: TranslateService) {}

  async ngOnInit() {
    await this.setupTheme();
    await this.setupLanguage();
  }

  async setupTheme() {
    const { value } = await Preferences.get({ key: 'isDarkMode' });

    if (value !== null) {
      const isDark = value === 'true';
      this.applyTheme(isDark);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme(prefersDark);
    }
  }

  applyTheme(isDark: boolean) {
    if (isDark) {
      document.documentElement.classList.add('ion-palette-dark');
    } else {
      document.documentElement.classList.remove('ion-palette-dark');
    }
  }

  async setupLanguage() {
    const { value } = await Preferences.get({ key: 'selectedLanguage' });

    if (value) {
      this.translate.use(value);
    } else {
      const browserLang = navigator.language.split('-')[0];
      const supportedLangs = ['en', 'cs'];
      const defaultLang = supportedLangs.includes(browserLang) ? browserLang : 'en';

      this.translate.setDefaultLang(defaultLang);
      this.translate.use(defaultLang);

      await Preferences.set({ key: 'selectedLanguage', value: defaultLang });
    }
  }
}
