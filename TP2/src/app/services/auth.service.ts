import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { DataService } from './data.service';
import { sendEmailVerification } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Paciente } from '../classes/paciente';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Especialista } from '../classes/especialista';
import { Admin } from '../classes/admin';

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

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore, private afStorage: AngularFireStorage, private router: Router) { }

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
          DNI: paciente.dni || '',
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

  async guardarEspecialista(especialista: Especialista, password: string): Promise<string> {
    try {
        // Registrar el usuario en Firebase Authentication
        const credential = await this.afAuth.createUserWithEmailAndPassword(especialista.mail, password);

        if (credential && credential.user) {
            // Guardar la imagen en Firebase Storage y obtener la URL de descarga
            const foto1Url = await this.uploadFileAndGetUrl(especialista.foto1, credential.user.uid, 'foto1');

            // Agregar los datos del especialista a Firestore con la URL de la imagen
            await this.afs.collection('especialistas').doc(credential.user.uid).set({
                nombre: especialista.nombre || '',
                apellido: especialista.apellido || '',
                edad: especialista.edad || '',
                DNI: especialista.dni || '',
                especialidad: especialista.especialidad || '',
                mail: especialista.mail || '',
                foto1: foto1Url || '',
                habilitado: false
            });

            // Retornar el ID del usuario creado
            return credential.user.uid;
        } else {
            throw new Error('No se pudo crear el usuario');
        }
    } catch (error) {
        console.error('Error al guardar el especialista en Firestore:', error);
        throw error;
    }
}

async guardarAdmin(admin: Admin, password: string): Promise<string> {
  try {
    // Registrar el usuario en Firebase Authentication
    const credential = await this.afAuth.createUserWithEmailAndPassword(admin.mail, password);

    if (credential && credential.user) {
      // Guardar la imagen en Firebase Storage y obtener la URL de descarga
      const fotoUrl = await this.uploadFileAndGetUrl(admin.foto1, credential.user.uid, 'foto1');

      // Agregar los datos del admin a Firestore con la URL de la imagen
      await this.afs.collection('administradores').doc(credential.user.uid).set({
        nombre: admin.nombre || '',
        apellido: admin.apellido || '',
        edad: admin.edad || '',
        DNI: admin.dni || '',
        mail: admin.mail || '',
        foto1: fotoUrl || '',
      });

      // Retornar el ID del usuario creado
      return credential.user.uid;
    } else {
      throw new Error('No se pudo crear el usuario');
    }
  } catch (error) {
    console.error('Error al guardar el admin en Firestore:', error);
    throw error;
  }
}

async login(email: string, password: string): Promise<void> {
  try {
    await this.afAuth.signInWithEmailAndPassword(email, password);
    // Redirigir a la página de inicio luego de iniciar sesión
    this.router.navigate(['/']);
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error;
  }
}

async logout(): Promise<void> {
  try {
    await this.afAuth.signOut();
    // Redirigir a la página de inicio de sesión luego de cerrar sesión
    this.router.navigate(['/login']);
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
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

  getCurrentUser() {
    return this.afAuth.currentUser;
  }

  async getEspecialistaData(uid: string): Promise<any> {
    try {
      const doc = await this.afs.collection('especialistas').doc(uid).ref.get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error('Error al obtener datos del especialista:', error);
      throw error;
    }
  }

  async getAllPacientes(): Promise<any[]> {
    try {
      const snapshot = await this.afs.collection('pacientes').get().toPromise();
  
      if (!snapshot) {
        throw new Error('No se encontraron documentos en la colección "pacientes"');
      }
  
      return snapshot.docs.map(doc => {
        const data = doc.data() as Record<string, any>; // Asegurar que 'data' sea un objeto
        return { id: doc.id, ...data };
      });
    } catch (error) {
      console.error('Error al obtener los datos de los pacientes:', error);
      throw error;
    }
  }

  async getAllAdmin(): Promise<any[]> {
    try {
      const snapshot = await this.afs.collection('administradores').get().toPromise();
  
      if (!snapshot) {
        throw new Error('No se obtuvo ningún snapshot de admin');
      }
  
      return snapshot.docs.map(doc => {
        const data = doc.data() as Record<string, any>; // Asegurar que 'data' sea un objeto
        return { id: doc.id, ...data };
      });
    } catch (error) {
      console.error('Error al obtener los datos de los admins:', error);
      throw error;
    }
  }

  async getAllEspecialistas(): Promise<any[]> {
    try {
      const snapshot = await this.afs.collection('especialistas').get().toPromise();
  
      if (!snapshot) {
        throw new Error('No se obtuvo ningún snapshot de especialistas');
      }
  
      return snapshot.docs.map(doc => {
        const data = doc.data() as Record<string, any>; // Asegurar que 'data' sea un objeto
        return { id: doc.id, ...data };
      });
    } catch (error) {
      console.error('Error al obtener los datos de los especialistas:', error);
      throw error;
    }
  }

  async toggleHabilitadoEspecialista(especialistaId: string, habilitado: boolean): Promise<void> {
    try {
      await this.afs.collection('especialistas').doc(especialistaId).update({ habilitado: habilitado });
    } catch (error) {
      console.error('Error al cambiar la habilitación del especialista:', error);
      throw error;
    }
  }
  
}
