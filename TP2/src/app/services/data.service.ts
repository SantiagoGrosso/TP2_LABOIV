import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentData, DocumentReference, QueryDocumentSnapshot, QueryFn, QuerySnapshot, SnapshotOptions } from '@angular/fire/compat/firestore';
import { collection, getDocs, query } from 'firebase/firestore';
import { Observable, Subject, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private firestore: AngularFirestore) { 
  }

 
}
