import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { DataService } from './data.service';
import { sendEmailVerification } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Paciente } from '../classes/paciente';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public usuarioLogueado: any = null;
  public esAdmin: boolean = false;
  public esEspecialista: boolean = false;
  public esPaciente: boolean = false;
  public uid: string = "";
  private usuariosChanged = new Subject<void>();
  public mailSinConfirmar: string = "";
  public isLoading: boolean = false;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore, private afStorage: AngularFireStorage) { }

  async guardarPaciente(paciente: Paciente, password: string): Promise<string> {
    try {
      // Registrar el usuario en Firebase Authentication
      const credential = await this.afAuth.createUserWithEmailAndPassword(paciente.mail, password);

      if (credential && credential.user) {
        // Guardar las imágenes en Firebase Storage y obtener las URLs de descarga
        const foto1Url = await this.uploadFileAndGetUrl(paciente.foto1, credential.user.uid, 'foto1');
        const foto2Url = await this.uploadFileAndGetUrl(paciente.foto2, credential.user.uid, 'foto2');

        // Agregar los datos del paciente a Firestore con las URLs de las imágenes
        await this.afs.collection('pacientes').doc(credential.user.uid).set({
          nombre: paciente.nombre || '',
          apellido: paciente.apellido || '',
          edad: paciente.edad || '',
          DNI: paciente.DNI || '',
          obraSocial: paciente.obraSocial || '',
          mail: paciente.mail || '',
          foto1: foto1Url || '',
          foto2: foto2Url || '',
        });

        // Retornar el ID del usuario creado
        return credential.user.uid;
      } else {
        throw new Error('No se pudo crear el usuario');
      }
    } catch (error) {
      console.error('Error al guardar el paciente en Firestore:', error);
      throw error;
    }
  }

  // Función para subir archivo a Firebase Storage y obtener la URL de descarga
  async uploadFileAndGetUrl(file: File, userId: string, fileName: string): Promise<string> {
    try {
      if (!file || !(file instanceof Blob)) {
        throw new Error('El archivo no es válido');
      }

      // Referencia al directorio en Firebase Storage donde se almacenarán las imágenes
      const storageRef = this.afStorage.storage.ref(`users/${userId}/${fileName}`);

      // Subir el archivo a Firebase Storage
      await storageRef.put(file);

      // Obtener la URL de descarga del archivo subido
      const downloadUrl = await storageRef.getDownloadURL();

      return downloadUrl;
    } catch (error) {
      console.error('Error al subir archivo a Firebase Storage:', error);
      throw error;
    }
  }
  
}
