import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ModelInput {
  Label: string;
  ImageSource: string;
}

export interface ModelOutput {
  label: number;
  imageSource: string;
  predictedLabel: string;
  score: number[];
}

@Injectable({
  providedIn: 'root'
})
export class MLService {

  private apiUrl = 'https://localhost:53985/api/ML/predict';

  constructor(private http: HttpClient) {}

  predict(input: ModelInput): Observable<ModelOutput> {
    const predictUrl = `${this.apiUrl}`;
    return this.http.post<ModelOutput>(predictUrl, input);
  }

  uploadImage(file: File): Observable<string> {
    const reader = new FileReader();
  
    return new Observable<string>((observer) => {
      reader.onloadend = () => {
        const result = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(result);

        let binaryString = '';
        for (let i = 0; i < uint8Array.length; i++) {
          binaryString += String.fromCharCode(uint8Array[i]);
        }

        const base64String = btoa(binaryString);
  
        observer.next(base64String);
        observer.complete();
      };
  
      reader.onerror = (error) => {
        observer.error(error);
      };
  
      reader.readAsArrayBuffer(file);
    });
  }
}
