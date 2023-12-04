import { Component } from '@angular/core';
import { MLService, ModelInput, ModelOutput } from './ml.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MLService],
})
export class AppComponent {
  selectedFile: File | null = null;
  fileName: string | null = null;
  prediction: ModelOutput | null = null;
  isLoading = false;
  error: string | null = null;
  selectedImageSource: SafeUrl | null = null;

  constructor(private mlService: MLService, private sanitizer: DomSanitizer) { }

  onFileSelected(event: any): void {
    this.reset();

    try
    {
      this.selectedFile = event.target.files[0];

      if (this.selectedFile) {
        const reader = new FileReader();

        reader.onload = (e) => {
          this.selectedImageSource = this.sanitizer.bypassSecurityTrustUrl(e.target?.result as string);
        };

        reader.readAsDataURL(this.selectedFile);
      }
    }
    catch (error)
    {
      console.error('Error reading file:', error);
    }
  }

  predict(): void {
    this.isLoading = true;
    this.error = null;

    if (this.selectedFile) {
      const input: ModelInput =
      {
        Label: 'Unknown',
        ImageSource: "",
      };

      this.mlService.uploadImage(this.selectedFile).subscribe((imageSource: string) => {
        input.ImageSource = imageSource;

        this.mlService.predict(input).subscribe(
          (prediction: ModelOutput) => {
            this.prediction = prediction;
            this.isLoading = false;
          },
          (error) => {
            this.error = "Could not make a prediction, API unavailable";
            this.isLoading = false;
          }
        );
      });
    }
    else {
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
