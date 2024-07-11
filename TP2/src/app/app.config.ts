import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../enviroments/enviroment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { BrowserModule } from '@angular/platform-browser';
import { AuthService } from './services/auth.service';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore } from 'firebase/firestore';
import { RecaptchaCommonModule } from 'ng-recaptcha/lib/recaptcha-common.module';
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxEchartsModule } from 'ngx-echarts';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
    importProvidersFrom(
      FormsModule,
      ReactiveFormsModule,
      AngularFireModule.initializeApp({
        apiKey: "AIzaSyDGif3NJXC7v7VKBGL1rhq_yiAQKG94WfU",
        authDomain: "tp02-ef411.firebaseapp.com",
        projectId: "tp02-ef411",
        storageBucket: "tp02-ef411.appspot.com",
        messagingSenderId: "1038947319102",
        appId: "1:1038947319102:web:c95224758351e20770806f"}),
      AngularFirestoreModule,
      AngularFireAuthModule, 
      BrowserModule,
      AuthService,
      RecaptchaModule,
      RecaptchaFormsModule,
      BrowserAnimationsModule,
      NgxChartsModule,
      NgxEchartsModule.forRoot({
        echarts: () => import('echarts')
      })
    )
  ]
};
