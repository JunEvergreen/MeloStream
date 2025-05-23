import { Component, OnInit, OnDestroy } from '@angular/core';
import { JamendoService, JamendoTrack } from '../services/jamendo.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-streaming',
  templateUrl: './streaming.page.html',
  styleUrls: ['./streaming.page.scss'],
  standalone: false
})
export class StreamingPage implements OnInit, OnDestroy {
  tracks: JamendoTrack[] = [];
  error: string = '';
  loading: boolean = false;
  currentlyPlaying: JamendoTrack | null = null;
  audio: HTMLAudioElement | null = null;
  private searchSubscription: Subscription | null = null;
  private initialLoadSubscription: Subscription | null = null;

  constructor(private jamendoService: JamendoService) {}

  ngOnDestroy() {
    this.stopAudio();
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    if (this.initialLoadSubscription) {
      this.initialLoadSubscription.unsubscribe();
    }
  }

  private stopAudio() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.currentlyPlaying = null;
  }

  playTrack(track: JamendoTrack) {
    if (this.currentlyPlaying?.id === track.id) {
      // Pause current track
      this.stopAudio();
      return;
    }

    // Stop current audio if any
    this.stopAudio();

    // Play new track
    this.audio = new Audio(track.audio);
    this.currentlyPlaying = track;
    
    this.audio.play().catch(err => {
      console.error('Audio playback error:', err);
      this.error = 'Failed to play track';
      this.currentlyPlaying = null;
      this.audio = null;
    });

    // Handle audio ended event
    this.audio.onended = () => {
      this.currentlyPlaying = null;
      this.audio = null;
    };
  }

  ngOnInit() {
    this.loadTracks();
  }

  loadTracks() {
    this.loading = true;
    this.error = '';
    if (this.initialLoadSubscription) {
      this.initialLoadSubscription.unsubscribe();
    }
    this.initialLoadSubscription = this.jamendoService.getRandomTracks(20).subscribe({
      next: (tracks) => {
        this.tracks = Array.isArray(tracks) ? tracks : [];
        this.loading = false;
        if (this.tracks.length === 0) {
          console.warn('No tracks returned from getRandomTracks or the result was not an array.');
        }
      },
      error: (err) => {
        console.error('Error fetching random tracks:', err);
        this.error = typeof err === 'string' ? err : 'Failed to load random tracks';
        this.loading = false;
      }
    });
  }

  handleSearchInput(event: any) {
    const query = event.target.value?.toLowerCase().trim();
    
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    if (this.initialLoadSubscription) {
      this.initialLoadSubscription.unsubscribe(); // Cancel initial load if a search is performed
    }

    if (!query || query === '') {
      this.tracks = []; // Clear current tracks before loading initial ones
      this.loadTracks(); 
      return;
    }

    this.loading = true;
    this.error = '';
    this.tracks = [];

    this.searchSubscription = this.jamendoService.searchTracks(query, 20).subscribe({
      next: (tracksResponse) => {
        this.tracks = Array.isArray(tracksResponse) ? tracksResponse : [];
        this.loading = false;
        if (this.tracks.length === 0) {
          this.error = 'No tracks found for your search.';
        }
      },
      error: (err) => {
        console.error('Error searching tracks:', err);
        this.error = typeof err === 'string' ? err : 'Failed to search tracks';
        this.loading = false;
      }
    });
  }

  loadSongs() {
    this.loadTracks();
  }

  retry() {
    this.error = '';
    const searchbar = document.querySelector('ion-searchbar');
    if (searchbar && searchbar.value) {
        searchbar.value = ''; // Clear search bar
    }
    this.loadTracks(); 
  }
}
