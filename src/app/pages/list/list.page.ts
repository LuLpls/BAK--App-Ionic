import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TranslateModule],
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  listId: string = '';
  listName: string = '';
  items: { id: string; name: string; quantity?: string; unit?: string; purchased: boolean }[] = [];
  private readonly STORAGE_KEY = 'shoppingLists';

  constructor(
    private route: ActivatedRoute,
    private alertController: AlertController,
    private translate: TranslateService
  ) {}

  async ngOnInit() {
    this.listId = this.route.snapshot.paramMap.get('id') || '';
    await this.loadItems();
  }

  async loadItems() {
    const { value } = await Preferences.get({ key: this.STORAGE_KEY });
    if (value) {
      const lists = JSON.parse(value);
      const currentList = lists.find((list: any) => list.id === this.listId);
      if (currentList) {
        this.listName = currentList.name;
        this.items = currentList.items || [];
      }
    }
  }

  async saveItems() {
    const { value } = await Preferences.get({ key: this.STORAGE_KEY });
    if (value) {
      const lists = JSON.parse(value);
      const index = lists.findIndex((list: any) => list.id === this.listId);
      if (index > -1) {
        lists[index].items = this.items;
        await Preferences.set({
          key: this.STORAGE_KEY,
          value: JSON.stringify(lists),
        });
      }
    }
  }

  async addItem() {
    const alert = await this.alertController.create({
      header: this.translate.instant('list.addItem'),
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: this.translate.instant('list.namePlaceholder'),
          attributes: { maxlength: 30 }
        },
        {
          name: 'quantity',
          type: 'text',
          placeholder: this.translate.instant('list.quantityPlaceholder'),
          attributes: { maxlength: 10 }
        },
        {
          name: 'unit',
          type: 'text',
          placeholder: this.translate.instant('list.unitPlaceholder'),
          attributes: { maxlength: 10 }
        }
      ],
      buttons: [
        {
          text: this.translate.instant('common.cancel'),
          role: 'cancel',
        },
        {
          text: this.translate.instant('list.addButton'),
          handler: async (data) => {
            const start = performance.now(); // performance test starting

            const error = this.validateItemInput(data, false);
            if (error) {
              await this.showValidationError(error);
              return false;
            }

            const newItem = {
              id: Math.random().toString(),
              name: data.name.trim(),
              quantity: data.quantity?.trim(),
              unit: data.unit?.trim(),
              purchased: false,
            };
            this.items.push(newItem);
            this.sortItems();
            this.saveItems();

            const end = performance.now(); // performance test ending
            console.log(`[PERF] addItem took ${Math.round(end - start)} ms`);

            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  async editItem(item: any) {
    const alert = await this.alertController.create({
      header: this.translate.instant('list.editItem'),
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: item.name,
          placeholder: this.translate.instant('list.namePlaceholder'),
          attributes: { maxlength: 20 }
        },
        {
          name: 'quantity',
          type: 'text',
          value: item.quantity,
          placeholder: this.translate.instant('list.quantityPlaceholder'),
          attributes: { maxlength: 10 }
        },
        {
          name: 'unit',
          type: 'text',
          value: item.unit,
          placeholder: this.translate.instant('list.unitPlaceholder'),
          attributes: { maxlength: 10 }
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
            const start = performance.now(); // performance test starting

            const error = this.validateItemInput(data, true, item.id);
            if (error) {
              await this.showValidationError(error);
              return false;
            }

            item.name = data.name.trim();
            item.quantity = data.quantity?.trim();
            item.unit = data.unit?.trim();
            this.sortItems();
            this.saveItems();

            const end = performance.now(); // performance test ending
            console.log(`[PERF] editItem took ${Math.round(end - start)} ms`);

            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  validateItemInput(data: any, isEdit = false, currentItemId?: string): string | null {
    const name = data.name?.trim();
    const quantity = data.quantity?.trim();
    const unit = data.unit?.trim();

    if (!name || name.length === 0 || name.length > 30) {
      return this.translate.instant('validation.invalidName');
    }

    if (quantity && quantity.length > 10) {
      return this.translate.instant('validation.invalidQuantity');
    }

    if (quantity && (isNaN(Number(quantity)) || Number(quantity) <= 0)) {
      return this.translate.instant('validation.invalidQuantity');
    }

    if (unit && unit.length > 10) {
      return this.translate.instant('validation.invalidUnit');
    }

    return null;
  }

  async togglePurchased(item: any) {
    this.sortItems();
    await this.saveItems();
  }

  async deleteItem(item: any) {
    const start = performance.now(); // performance test starting

    this.items = this.items.filter(i => i.id !== item.id);
    this.sortItems();
    await this.saveItems();

    const end = performance.now(); // performance test ending
    console.log(`[PERF] deleteItem took ${Math.round(end - start)} ms`);

  }

  sortItems() {
    this.items.sort((a, b) => Number(a.purchased) - Number(b.purchased));
  }

  unpurchasedItems() {
    return this.items.filter(item => !item.purchased);
  }

  purchasedItems() {
    return this.items.filter(item => item.purchased);
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
}
