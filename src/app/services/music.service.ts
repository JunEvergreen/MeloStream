import { Injectable } from '@angular/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { BehaviorSubject } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { Howl } from 'howler';

export interface AudioFile {
  path: string;
  name: string;
  type: string;
  size: number;
  metadata?: {
    title?: string;
    artist?: string;
    album?: string;
    duration?: number;
  };
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTrack: AudioFile | null;
  currentTime: number;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private supportedFormats = ['.m4a', '.aac', '.mp3', '.wav', '.ogg', '.flac', '.opus'];
  private audioFiles = new BehaviorSubject<AudioFile[]>([]);
  private currentSound: Howl | null = null;
  private playbackState = new BehaviorSubject<PlaybackState>({
    isPlaying: false,
    currentTrack: null,
    currentTime: 0,
    duration: 0
  });

  audioFiles$ = this.audioFiles.asObservable();
  playbackState$ = this.playbackState.asObservable();

  constructor() {}

  private async requestPermissions(): Promise<boolean> {
    if (Capacitor.getPlatform() !== 'android') return true;
    const permissions = await Filesystem.checkPermissions();
    return permissions.publicStorage === 'granted';
  }

  async scanAudioFiles() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Storage permission not granted');
      }

      if (Capacitor.getPlatform() === 'android') {
        let allAudioFiles: AudioFile[] = [];
        const commonPaths = ['Music', 'Download', 'Documents'];

        for (const basePath of commonPaths) {
          try {
            const path = basePath.replace(/^\/|\/$/g, '');
            const result = await Filesystem.readdir({
              path,
              directory: Directory.ExternalStorage
            });

            if (result.files) {
              const files = await this.processDirectory(result.files, path);
              allAudioFiles = [...allAudioFiles, ...files];
            }
          } catch (error) {
            continue;
          }
        }

        const uniqueFiles = Array.from(new Map(allAudioFiles.map(file => [file.path, file])).values());
        this.audioFiles.next(uniqueFiles);
        return uniqueFiles;
      }
      
      return [];
    } catch (error) {
      throw error;
    }
  }

  private async processDirectory(entries: any[], currentRelativePath: string): Promise<AudioFile[]> {
    const audioFiles: AudioFile[] = [];

    if (!Array.isArray(entries)) return audioFiles;

    for (const entry of entries) {
      try {
        const name = entry.name;
        if (!name) continue;
        
        const dotIndex = name.lastIndexOf('.');
        if (dotIndex === -1) continue;
        
        const extension = name.slice(dotIndex).toLowerCase();
        const entryRelativePath = currentRelativePath ? `${currentRelativePath}/${name}` : name;

        if (this.supportedFormats.includes(extension)) {
          audioFiles.push({
            path: entryRelativePath,
            name: name,
            type: extension,
            size: entry.size || 0,
          });
        } 
        
        else if (entry.type === 'directory') {
          try {
            const subDirContent = await Filesystem.readdir({
              path: entryRelativePath,
              directory: Directory.ExternalStorage
            });
            if (subDirContent && subDirContent.files) {
              const subDirAudioFiles = await this.processDirectory(subDirContent.files, entryRelativePath);
              audioFiles.push(...subDirAudioFiles);
            }
          } catch (error) {
            continue;
          }
        }
      } catch (error) {
        continue;
      }
    }
    return audioFiles;
  }

  async getAudioFileMetadata(file: AudioFile): Promise<AudioFile> {
    return file;
  }

  async playAudio(file: AudioFile) {
    if (this.currentSound) {
      this.currentSound.stop();
    }

    try {
      let fileUrl: string;
      
      if (Capacitor.getPlatform() === 'android') {
        const result = await Filesystem.getUri({
          path: file.path,
          directory: Directory.ExternalStorage 
        });
        fileUrl = Capacitor.convertFileSrc(result.uri);
      } else {
        fileUrl = file.path; 
      }

      this.currentSound = new Howl({
        src: [fileUrl],
        html5: true,
        format: [file.type.replace('.', '')],
        onload: () => this.updatePlaybackState(false, file),
        onplay: () => {
          this.updatePlaybackState(true, file);
          this.startPlaybackTracking();
        },
        onpause: () => this.updatePlaybackState(false, file),
        onstop: () => this.updatePlaybackState(false, null),
        onend: () => this.updatePlaybackState(false, null)
      });

      this.currentSound.play();
    } catch (error) {
      throw error;
    }
  }

  pauseAudio() {
    if (this.currentSound && this.currentSound.playing()) {
      this.currentSound.pause();
    }
  }

  resumeAudio() {
    if (this.currentSound && !this.currentSound.playing()) {
      this.currentSound.play();
    }
  }

  stopAudio() {
    if (this.currentSound) {
      this.currentSound.stop();
    }
  }

  seekTo(position: number) {
    if (this.currentSound) {
      this.currentSound.seek(position);
      const currentState = this.playbackState.value;
      this.playbackState.next({
        ...currentState,
        currentTime: position
      });
    }
  }

  playNext() {
    const currentTrack = this.playbackState.value.currentTrack;
    if (!currentTrack) return;

    const currentIndex = this.audioFiles.value.findIndex(file => file.path === currentTrack.path);
    if (currentIndex === -1 || currentIndex === this.audioFiles.value.length - 1) return;

    const nextTrack = this.audioFiles.value[currentIndex + 1];
    this.playAudio(nextTrack);
  }

  playPrevious() {
    const currentTrack = this.playbackState.value.currentTrack;
    if (!currentTrack) return;

    const currentIndex = this.audioFiles.value.findIndex(file => file.path === currentTrack.path);
    if (currentIndex <= 0) return;

    const previousTrack = this.audioFiles.value[currentIndex - 1];
    this.playAudio(previousTrack);
  }

  canPlayNext(): boolean {
    const currentTrack = this.playbackState.value.currentTrack;
    if (!currentTrack) return false;

    const currentIndex = this.audioFiles.value.findIndex(file => file.path === currentTrack.path);
    return currentIndex < this.audioFiles.value.length - 1;
  }

  canPlayPrevious(): boolean {
    const currentTrack = this.playbackState.value.currentTrack;
    if (!currentTrack) return false;

    const currentIndex = this.audioFiles.value.findIndex(file => file.path === currentTrack.path);
    return currentIndex > 0;
  }

  private updatePlaybackState(isPlaying: boolean, track: AudioFile | null) {
    const currentState = this.playbackState.value;
    this.playbackState.next({
      ...currentState,
      isPlaying,
      currentTrack: track,
      duration: this.currentSound ? this.currentSound.duration() : 0
    });
  }

  private startPlaybackTracking() {
    if (this.currentSound) {
      const updateTime = () => {
        if (this.currentSound && this.currentSound.playing()) {
          const currentState = this.playbackState.value;
          this.playbackState.next({
            ...currentState,
            currentTime: this.currentSound.seek()
          });
          requestAnimationFrame(updateTime);
        }
      };
      updateTime();
    }
  }
}
