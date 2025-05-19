import { Component, OnInit, OnDestroy } from '@angular/core';
import { MusicService, AudioFile, PlaybackState } from '../services/music.service';
import { LoadingController, ToastController, AlertController, Platform } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-music-pmenu',
  templateUrl: './music-pmenu.page.html',
  styleUrls: ['./music-pmenu.page.scss'],
  standalone: false
})
export class MusicPMenuPage implements OnInit, OnDestroy {
  searchTerm: string = '';
  audioFiles: AudioFile[] = [];
  isScanning: boolean = false;
  playbackState$ = this.musicService.playbackState$;
  private currentState: PlaybackState | null = null;
  private stateSubscription!: Subscription;
  filteredFiles: AudioFile[] = [];

  constructor(
    private musicService: MusicService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private platform: Platform
  ) {
    this.musicService.audioFiles$.subscribe(files => {
      this.audioFiles = files;
      this.filteredFiles = files;
      this.searchMusic();
    });

    this.initializeBackButtonHandling();
  }

  private initializeBackButtonHandling() {
    if (Capacitor.getPlatform() === 'android') {
      App.addListener('backButton', () => App.exitApp());
    }
  }

  ngOnInit() {
    this.stateSubscription = this.playbackState$.subscribe(state => {
      this.currentState = state;
    });
  }

  ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    if (Capacitor.getPlatform() === 'android') {
      App.removeAllListeners();
    }
  }

  async scanAudio() {
    if (this.isScanning) return;

    const loading = await this.loadingController.create({
      message: 'Scanning for audio files...',
      spinner: 'circles'
    });
    await loading.present();
    this.isScanning = true;

    try {
      await this.musicService.scanAudioFiles();
      if (this.audioFiles.length === 0) {
        const alert = await this.alertController.create({
          header: 'No Audio Files Found',
          message: 'Make sure you have audio files in your device storage.',
          buttons: ['OK']
        });
        await alert.present();
      } else {
        const toast = await this.toastController.create({
          message: `Found ${this.audioFiles.length} audio files`,
          duration: 2000,
          position: 'bottom',
          color: 'success'
        });
        toast.present();
      }
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'Error Scanning Files',
        message: 'Failed to scan audio files. Make sure proper permissions are granted in Settings.',
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      this.isScanning = false;
      loading.dismiss();
    }
  }

  async playAudio(file: AudioFile) {
    const loading = await this.loadingController.create({
      message: 'Loading audio...',
      duration: 5000
    });
    await loading.present();

    try {
      await this.musicService.playAudio(file);
      const toast = await this.toastController.create({
        message: `Now playing: ${file.name}`,
        duration: 2000,
        position: 'bottom'
      });
      toast.present();
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'Playback Error',
        message: 'Unable to play this audio file. It may be corrupted or inaccessible.',
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      loading.dismiss();
    }
  }

  togglePlayPause() {
    if (!this.currentState) return;
    if (this.currentState.isPlaying) {
      this.musicService.pauseAudio();
    } else {
      this.musicService.resumeAudio();
    }
  }

  playNext() {
    this.musicService.playNext();
  }

  playPrevious() {
    this.musicService.playPrevious();
  }

  canPlayNext(): boolean {
    return this.musicService.canPlayNext();
  }

  canPlayPrevious(): boolean {
    return this.musicService.canPlayPrevious();
  }

  isCurrentTrack(file: AudioFile): boolean {
    if (!this.currentState || !this.currentState.currentTrack) return false;
    return this.currentState.currentTrack.path === file.path;
  }

  getCurrentProgress(): number {
    if (!this.currentState) return 0;
    if (!this.currentState.duration || this.currentState.duration <= 0) return 0;
    return this.currentState.currentTime / this.currentState.duration;
  }

  formatTime(seconds: number): string {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  searchMusic() {
    if (!this.searchTerm.trim()) {
      this.filteredFiles = this.audioFiles;
      return;
    }
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredFiles = this.audioFiles.filter(file => 
      file.name.toLowerCase().includes(searchLower) ||
      file.type.toLowerCase().includes(searchLower)
    );
  }

  onProgressBarClick(event: MouseEvent) {
    if (!this.currentState?.duration) return;
    const progressBar = (event.currentTarget as HTMLElement);
    const rect = progressBar.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, x / width));
    const timeToSeek = percentage * this.currentState.duration;
    this.currentState = {
      ...this.currentState,
      currentTime: timeToSeek
    };
    this.musicService.seekTo(timeToSeek);
  }
}
