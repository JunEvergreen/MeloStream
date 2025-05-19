import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MusicPMenuPage } from './music-pmenu.page';

const routes: Routes = [
  {
    path: '',
    component: MusicPMenuPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MusicPMenuPageRoutingModule {}
