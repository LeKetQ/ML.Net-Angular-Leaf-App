import { Component } from '@angular/core';
import { MLService, ModelOutput } from './ml.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BehaviorSubject, combineLatest, of, delay, startWith, scan, takeUntil, map, from, interval } from 'rxjs';
import { take, tap, switchMap, filter, catchError, shareReplay, concatMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MLService],
})

export class AppComponent {
  constructor(private mlService: MLService, private sanitizer: DomSanitizer) {

    this.percentage$.subscribe();
  }

  counter: number = 0.00;
  selectedFile: File | null = null;
  isLoading = false;
  error: string | null = null;
  selectedImageSource: SafeUrl | null = null;

  behaviorObject$ = new BehaviorSubject<File | null>(null);
  private predictionResult$ = this.behaviorObject$

    // (pipe) setup a "workflow"
    .pipe(

      // (tap) Do this as a side job
      tap(() => {
        this.error = null;
      }),

      // (filter) similar to if
      filter(
        (item) => item != null,
      ),

      // (tap) Do this as a side job
      tap(() =>
        this.isLoading = true,
      ),

      // (switchMap) Put something in, get something else out
      switchMap(
        (file) => this.mlService.predictFromImage$(file as File)
          .pipe(
            // (take) Only make one call
            take(1),

            // (tap) Do this as a side job
            tap((prediction) => {
              this.isLoading = false;
              this.percentageSubject$.next(this.getMaxNumber(prediction.score));
            }),

            catchError((error) => {
              console.log(error);
              this.error = "Oops, something went wrong!";
              this.isLoading = false;

              // (of) return null in the observable object
              return of(null);
            }),

            // (shareReplay) If this was already asked, don't do it again, return the same response
            shareReplay(1)
          )
      )
    )

  private isCancelled$ = new BehaviorSubject(false);
  prediction$ =

    // (combineLatest) combine two or more varibles in the observable, if one changes, the "workflow" is triggered again
    combineLatest([this.predictionResult$, this.isCancelled$])
      .pipe(
        switchMap(([prediction, isCancelled]) => {
          if (!isCancelled) {
            return of(prediction)
          }
          else {
            return of(null);
          }
        }),
        shareReplay(1)
      );

  private percentageSubject$ = new BehaviorSubject<number | null>(null);
  percentage$ = this.percentageSubject$
    .pipe(
      tap(
        () => this.counter = 0.00
      ),
      filter(
        (item) => item != null,
      ),
      switchMap(
        (item) => of((item as number) * 100),
      ),
      tap(
        (item) => {
          const intervalId = setInterval(() => {
            if (this.counter < (item)) {
              this.counter += 0.11;
            } else {
              clearInterval(intervalId);
              this.counter = item;
            }
          }, 0.1);
        }
      ),
    );


  onFileSelected(event: any): void {
    this.selectedImageSource = null;
    this.error = null;
    this.isLoading = false;
    this.selectedFile = event.target.files[0];
    this.isCancelled$.next(false);

    if (this.selectedFile) {

      // Upload the image to render it on the webpage
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImageSource = this.sanitizer.bypassSecurityTrustUrl(e.target?.result as string);
      };
      reader.readAsDataURL(this.selectedFile);

    }
    else {
      this.isCancelled$.next(true);
    }
  }

  getMaxNumber(scores: number[]): number {
    return scores.sort((a, b) => b - a)[0];
  }

  setSelectedFile() {
    return this.behaviorObject$.next(this.selectedFile)
  }
}
