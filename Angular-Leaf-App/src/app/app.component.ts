import { Component } from '@angular/core';
import { MLService, ModelOutput } from './ml.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { take, tap, switchMap, filter, catchError, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MLService],
})
export class AppComponent {
  constructor(private mlService: MLService, private sanitizer: DomSanitizer) { }

  selectedFile: File | null = null;
  isLoading = false;
  error: string | null = null;
  selectedImageSource: SafeUrl | null = null;

  behaviorObject$ = new BehaviorSubject<File | null>(null);
  private predictionResult$ = this.behaviorObject$.pipe(
    tap(() => {
      this.error = null;
    }),
    filter(
      (item) => item != null,
    ),
    tap(() =>
      this.isLoading = true,
    ),
    switchMap(
      (file) => this.mlService.predictFromImage$(file as File)
        .pipe(
          take(1),
          tap(() => {
            this.isLoading = false;
          }),

          // Only make one call
          catchError((error) => {
            console.log(error);
            this.error = "Oops, something went wrong!";
            this.isLoading = false;
            return of(null);
          }),
          shareReplay(1)
        )
    )
  )

  private isCancelled$ = new BehaviorSubject(false);
  prediction$ = combineLatest([this.predictionResult$, this.isCancelled$])
    .pipe(
      switchMap(([prediction, isCancelled]) => {
        if (isCancelled) {
          return of(null)
        }
        else {
          return of(prediction);
        }
      }),
      shareReplay(1)
    );

  onFileSelected(event: any): void {
    this.selectedImageSource = null;
    this.error = null;
    this.isLoading = false;
    this.selectedFile = event.target.files[0];

    if (this.selectedFile) {

      // Upload the image to render it on the webpage
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImageSource = this.sanitizer.bypassSecurityTrustUrl(e.target?.result as string);
      };

      reader.readAsDataURL(this.selectedFile);
      if (this.isCancelled$.value) {
        this.isCancelled$.next(false);
      }
    }
    else {
      this.isCancelled$.next(true);
    }
  }
}
