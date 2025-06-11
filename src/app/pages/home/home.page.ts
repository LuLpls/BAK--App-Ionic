import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, CommonModule, TranslateModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
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
          attributes: {
            maxlength: 50
          }
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
            if (data.name.trim().length === 0) {
              return false;
            }
            if (data.name.length > 50) {
              return false;
            }
            const newList = {
              id: Math.random().toString(),
              name: data.name,
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
          attributes: {
            maxlength: 50
          }
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
            if (data.name.trim().length === 0 || data.name.length > 50) {
              return false;
            }
            list.name = data.name;
            await this.saveLists();
            return true;
          },
        },
      ],
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
