import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MusicPMenuPageRoutingModule } from './music-pmenu-routing.module';

import { MusicPMenuPage } from './music-pmenu.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MusicPMenuPageRoutingModule
  ],
  declarations: [MusicPMenuPage]
})
export class MusicPMenuPageModule {}
