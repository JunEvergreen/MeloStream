import { Component } from '@angular/core';
import { App } from '@capacitor/app';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private platform: Platform) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();
    
    if (Capacitor.getPlatform() === 'android') {
      try {
        const deviceInfo = await App.getInfo();
        const osVersion = deviceInfo.version || '';
        const versionNumber = parseInt(osVersion, 10);
        (window as any).AndroidVersion = versionNumber || 0;
      } catch (error) {
        console.warn('Failed to get Android version:', error);
        (window as any).AndroidVersion = 0;
      }
    }
  }
}
