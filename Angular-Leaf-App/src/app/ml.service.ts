import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, takeUntil, take } from 'rxjs/operators';
import { throwError, Observable, Subject, switchMap } from 'rxjs';

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

  // Variables
  private ngUnsubscribe = new Subject<void>();
  private apiUrl = 'https://localhost:53985/api/ML/predict';

  // Constructor
  constructor(private http: HttpClient) { }

  // Functions
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  predictFromImage$(file: File): Observable<ModelOutput> {

    return this.uploadImage(file)
      .pipe(
        take(1),
        switchMap(imageSource => {

          const modelInput: ModelInput =
          {
            Label: 'Unknown',
            ImageSource: imageSource,
          };

          return this.predict(modelInput);
        }),
        take(1)
      );
  }

  predict(input: ModelInput): Observable<ModelOutput> {
    return this.http.post<ModelOutput>(this.apiUrl, input)
      .pipe(takeUntil(this.ngUnsubscribe),
        catchError((error) => {
          return throwError(error);
        })
      );
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
