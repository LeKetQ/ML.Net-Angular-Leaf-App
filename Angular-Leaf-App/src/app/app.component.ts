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
  loading = false;

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
    this.loading = true;
    if (this.selectedFile) 
    {
      const input: ModelInput = 
      {
        Label: this.fileName || 'Unknown',
        ImageSource: "",
      };

      this.mlService.uploadImage(this.selectedFile).subscribe((imageSource: string) => 
      {
        input.ImageSource = imageSource;

        this.mlService.predict(input).subscribe((prediction: ModelOutput) => 
        {
          console.log('Prediction:', prediction);
          this.prediction = prediction;
          this.loading = false;
        });

      });
    } 
    else 
    {
      // TODO: Make it pretty
      console.error('No file selected');
      this.fileName = null;
      this.loading = false;
    }
  }
}
