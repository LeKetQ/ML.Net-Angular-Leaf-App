import { Component } from '@angular/core';
import { MLService, ModelInput, ModelOutput } from './ml.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MLService],
})
export class AppComponent {
  private selectedFile: File | null = null;
  fileName: string | null = null;
  prediction: ModelOutput | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(private mlService: MLService, private http: HttpClient) {}

  onFileSelected(event: any): void {
    try 
    {
        this.selectedFile = event.target.files[0];
        this.fileName = this.selectedFile?.name || 'Unknown';
    } 
    catch (error) 
    {
        console.error('Error reading file:', error);
    }
  }

  predict(): void {
    this.isLoading = true;
    this.error = null;

    try
    {
      if (this.selectedFile) {
        const input: ModelInput =
        {
          Label: this.fileName || 'Unknown',
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
    catch (error)
    {
      this.error = "Something went wrong, please try again.";
      this.fileName = null;
      this.isLoading = false;
    }
  }
}
