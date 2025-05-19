import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage {
  constructor(private navCtrl: NavController, private alertController: AlertController) {
    this.checkIfFirstTimeUser();
  }

  async checkIfFirstTimeUser() {
    const { value } = await Preferences.get({ key: 'isFirstTimeUser' });
    if (value === 'false') {
      this.navCtrl.navigateForward('/music-pmenu');
    }
  }

  async agreeAndContinue() {
    await Preferences.set({ key: 'isFirstTimeUser', value: 'false' });
    this.navCtrl.navigateForward('/music-pmenu');
  }

  onDisagree() {
    console.log('User disagreed with the terms.');
  }

  async resetAgreement() {
    await Preferences.remove({ key: 'isFirstTimeUser' });
    console.log('Agreement reset. You can now see the user notes again.');
  }

  async showTerms() {
    const alert = await this.alertController.create({
      header: 'Terms and Conditions',
      message: 'Tralalero tralala, Bombardino crocodilo, Tung Tung Tung Tung Sahur, Brrt Brrt Patapim.',
      buttons: ['OK'],
    });

    await alert.present();
  }
}
