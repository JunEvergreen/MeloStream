import { Component, OnInit } from '@angular/core';
import { SpotifyService, SpotifyTrack } from '../services/spotify.service';

@Component({
  selector: 'app-streaming',
  templateUrl: './streaming.page.html',
  styleUrls: ['./streaming.page.scss'],
  standalone: false
})
export class StreamingPage implements OnInit {
  newReleases: SpotifyTrack[] = [];
  featuredPlaylists: any[] = [];
  error: string = '';
  loading: boolean = false;
  playlistsLoading: boolean = false;

  constructor(private spotifyService: SpotifyService) {}

  ngOnInit() {
    this.loadNewReleases();
    this.loadFeaturedPlaylists();
  }

  loadNewReleases() {
    this.loading = true;
    this.error = '';
    this.spotifyService.getNewReleases().subscribe({
      next: (data) => {
        if (data?.albums?.items) {
          this.newReleases = data.albums.items;
        } else {
          this.error = 'Invalid response format for new releases';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('New releases error:', err);
        this.error = err.error?.error?.message || 'Failed to load new releases';
        this.loading = false;
      }
    });
  }

  loadFeaturedPlaylists() {
    this.playlistsLoading = true;
    this.spotifyService.getFeaturedPlaylists().subscribe({
      next: (data) => {
        if (data?.playlists?.items) {
          this.featuredPlaylists = data.playlists.items;
        } else {
          this.error = this.error ? this.error + '\nInvalid playlists format' : 'Invalid playlists format';
        }
        this.playlistsLoading = false;
      },
      error: (err) => {
        console.error('Playlists error:', err);
        const playlistError = err.error?.error?.message || 'Failed to load playlists';
        this.error = this.error ? this.error + '\n' + playlistError : playlistError;
        this.playlistsLoading = false;
      }
    });
  }

  retry() {
    this.error = '';
    this.loadNewReleases();
    this.loadFeaturedPlaylists();
  }
}
