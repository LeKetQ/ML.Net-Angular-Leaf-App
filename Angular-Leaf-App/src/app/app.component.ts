import { Component, OnDestroy } from '@angular/core';
import { MLService, ModelInput, ModelOutput } from './ml.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MLService],
})
export class AppComponent implements OnDestroy {

  // Variables
  private ngUnsubscribe = new Subject<void>();
  selectedFile: File | null = null;
  fileName: string | null = null;
  prediction: ModelOutput | null = null;
  isLoading = false;
  error: string | null = null;
  selectedImageSource: SafeUrl | null = null;

  // Constructor
  constructor(private mlService: MLService, private sanitizer: DomSanitizer) { }

  // Functions
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onFileSelected(event: any): void {
    this.reset();

    try {
      this.selectedFile = event.target.files[0];

      if (this.selectedFile) {

        // Upload the image to render it on the webpage
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedImageSource = this.sanitizer.bypassSecurityTrustUrl(e.target?.result as string);
        };
        reader.readAsDataURL(this.selectedFile);
      }
    }
    catch (error) {
      this.error = "Something went wrong, please try again."
      console.log(error);
    }
  }

  predict(): void {
    this.isLoading = true;
    this.error = null;
    this.prediction = null;

    if (this.selectedFile) {

      // Create the input model
      const input: ModelInput =
      {
        Label: 'Unknown',
        ImageSource: "",
      };

      // Upload the image to the MLService
      this.mlService
        .uploadImage(this.selectedFile)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((imageSource: string) => {
          input.ImageSource = imageSource;

          // Predict through API call
          this.mlService
            .predict(input)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((prediction: ModelOutput) => {
              this.prediction = prediction;
              this.isLoading = false;
            },
              // API error
              (error) => {
                this.error = "Could not make a prediction, API unavailable";
                this.isLoading = false;
                console.log(error);
              });
        },
          // Upload error
          (error) => {
            this.error = "Could not upload the image, please try again."
            console.log(error);
          });
    }
    else {
      // No file selected
      this.fileName = null;
      this.isLoading = false;
    }
  }

  reset(): void {
    this.error = null;
    this.prediction = null;
    this.selectedFile = null;
    this.fileName = null;
    this.isLoading = false;
  }
}
