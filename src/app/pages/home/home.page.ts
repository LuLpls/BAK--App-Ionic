import { Component, OnInit, AfterViewInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, CommonModule, TranslateModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {
  shoppingLists: { id: string; name: string }[] = [];
  private readonly STORAGE_KEY = 'shoppingLists';

  constructor(
    private alertController: AlertController,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadLists();
  }

  ngAfterViewInit() {
    const renderEnd = performance.now(); // performance test ending, starting is in index.html
    const startupTime = renderEnd - (window as any).appStart;
    setTimeout(() => {
      console.log(`[PERF] Full app startup time: ${startupTime.toFixed(2)} ms`);
    }, 6000); 
  }

  async loadLists() {
    const { value } = await Preferences.get({ key: this.STORAGE_KEY });
    if (value) {
      this.shoppingLists = JSON.parse(value);
    }
  }

  async saveLists() {
    await Preferences.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(this.shoppingLists),
    });
  }

  async addList() {
    const alert = await this.alertController.create({
      header: this.translate.instant('home.addList'),
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: this.translate.instant('home.namePlaceholder'),
          attributes: { maxlength: 30 }
        }
      ],
      buttons: [
        {
          text: this.translate.instant('common.cancel'),
          role: 'cancel',
        },
        {
          text: this.translate.instant('home.addListButton'),
          handler: async (data) => {
            const name = data.name?.trim();
            const error = this.validateListName(name);
            if (error) {
              await this.showValidationError(error);
              return false;
            }

            const newList = {
              id: Math.random().toString(),
              name: name,
            };
            this.shoppingLists.push(newList);
            await this.saveLists();
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  async editList(list: { id: string; name: string }) {
    const alert = await this.alertController.create({
      header: this.translate.instant('home.editList'),
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: list.name,
          placeholder: this.translate.instant('home.namePlaceholder'),
          attributes: { maxlength: 30 }
        }
      ],
      buttons: [
        {
          text: this.translate.instant('common.cancel'),
          role: 'cancel',
        },
        {
          text: this.translate.instant('common.save'),
          handler: async (data) => {
            const name = data.name?.trim();
            const error = this.validateListName(name);
            if (error) {
              await this.showValidationError(error);
              return false;
            }

            list.name = name;
            await this.saveLists();
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  validateListName(name: string): string | null {
    if (!name || name.trim().length === 0 || name.length > 30) {
      return this.translate.instant('validation.invalidName');
    }
    return null;
  }

  async showValidationError(message: string) {
    const alert = await this.alertController.create({
      header: this.translate.instant('common.error'),
      message: message,
      buttons: [
        {
          text: this.translate.instant('common.ok'),
          role: 'cancel',
        }
      ]
    });

    await alert.present();
  }

  async deleteList(listId: string) {
    const alert = await this.alertController.create({
      header: this.translate.instant('home.deleteListHeader'),
      message: this.translate.instant('home.deleteListMessage'),
      buttons: [
        {
          text: this.translate.instant('common.no'),
          role: 'cancel',
        },
        {
          text: this.translate.instant('common.yesDelete'),
          handler: async () => {
            this.shoppingLists = this.shoppingLists.filter(list => list.id !== listId);
            await this.saveLists();
          },
        },
      ],
    });

    await alert.present();
  }

  openList(listId: string) {
    this.router.navigate(['/list', listId]);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }
}
