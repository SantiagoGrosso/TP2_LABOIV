import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, map, of, switchMap } from 'rxjs';
import { User, getAuth, sendEmailVerification } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Paciente } from '../classes/paciente';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Especialista } from '../classes/especialista';
import { Admin } from '../classes/admin';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public esAdmin: boolean = false;
  public esEspecialista: boolean = false;
  public esPaciente: boolean = false;
  user$: Observable<any>;
  isLoggedIn$: Observable<boolean>;

  private roleSubject = new BehaviorSubject<{ esAdmin: boolean, esEspecialista: boolean, esPaciente: boolean }>({
    esAdmin: false,
    esEspecialista: false,
    esPaciente: false
  });

  public role$: Observable<{ esAdmin: boolean, esEspecialista: boolean, esPaciente: boolean }> = this.roleSubject.asObservable();

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore, private afStorage: AngularFireStorage, private router: Router) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.getUserRole(user.uid).then(roleData => {
            this.roleSubject.next({
              esAdmin: roleData.role === 'admin',
              esEspecialista: roleData.role === 'especialista',
              esPaciente: roleData.role === 'paciente'
            });
            return of(user);
          });
        } else {
          this.roleSubject.next({ esAdmin: false, esEspecialista: false, esPaciente: false });
          return of(null);
        }
      })
    );

    this.isLoggedIn$ = this.user$.pipe(map(user => !!user));
  }

  async guardarPaciente(paciente: Paciente, password: string): Promise<string> {
    try {
        // Registrar el usuario en Firebase Authentication
        const credential = await this.afAuth.createUserWithEmailAndPassword(paciente.mail, password);
        let user = credential.user;

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

            // Enviar verificación de correo
            if (user != null) {
                await user.sendEmailVerification();
            }

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

  async guardarEspecialista(especialista: Especialista, password: string, horarios: string[]): Promise<string> {
    try {
      // Registrar el usuario en Firebase Authentication
      const credential = await this.afAuth.createUserWithEmailAndPassword(especialista.mail, password);
      const user = credential.user;

      if (user) {
        // Guardar la imagen en Firebase Storage y obtener la URL de descarga
        const foto1Url = await this.uploadFileAndGetUrl(especialista.foto1, user.uid, 'foto1');

        // Agregar los datos del especialista a Firestore con la URL de la imagen y los horarios
        await this.afs.collection('especialistas').doc(user.uid).set({
          nombre: especialista.nombre || '',
          apellido: especialista.apellido || '',
          edad: especialista.edad || '',
          DNI: especialista.dni || '',
          especialidad: especialista.especialidad || '',
          mail: especialista.mail || '',
          foto1: foto1Url || '',
          habilitado: false,
          horarios: horarios || [] // Guardar los horarios recibidos
        });

        // Enviar verificación de correo
        await user.sendEmailVerification();

        // Retornar el ID del usuario creado
        return user.uid;
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
      let user = credential.user;

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

          // Enviar verificación de correo
          if (user != null) {
              await user.sendEmailVerification();
          }

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
    const credential = await this.afAuth.signInWithEmailAndPassword(email, password);
    const user = credential.user;

    if (user) {
      // Verificar si el correo electrónico está verificado
      if (!user.emailVerified) {
        await this.afAuth.signOut();
        throw new Error('Email no verificado');
      }

      this.esAdmin = false;
      this.esEspecialista = false;
      this.esPaciente = false;

      const adminDoc = await this.afs.collection('administradores').doc(user.uid).ref.get();
      if (adminDoc.exists) {
        this.esAdmin = true;
      } else {
        const especialistaDoc = await this.afs.collection('especialistas').doc(user.uid).ref.get();
        if (especialistaDoc.exists) {
          this.esEspecialista = true;
        } else {
          const pacienteDoc = await this.afs.collection('pacientes').doc(user.uid).ref.get();
          if (pacienteDoc.exists) {
            this.esPaciente = true;
          }
        }
      }

      this.roleSubject.next({
        esAdmin: this.esAdmin,
        esEspecialista: this.esEspecialista,
        esPaciente: this.esPaciente
      });
    }

    this.router.navigate(['/']);
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error;
  }
}


async logout(): Promise<void> {
  await this.afAuth.signOut();
  this.router.navigate(['/login']);
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

  async getCurrentUser(): Promise<User | null> {
    const auth = getAuth();
    const user = auth.currentUser;
    return user;
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

  async getUserRole(uid: string): Promise<{ role: string, data: any }> {
    const adminDoc = await this.afs.collection('administradores').doc(uid).ref.get();
    if (adminDoc.exists) {
      return { role: 'admin', data: adminDoc.data() };
    }
  
    const especialistaDoc = await this.afs.collection('especialistas').doc(uid).ref.get();
    if (especialistaDoc.exists) {
      return { role: 'especialista', data: especialistaDoc.data() };
    }
  
    const pacienteDoc = await this.afs.collection('pacientes').doc(uid).ref.get();
    if (pacienteDoc.exists) {
      return { role: 'paciente', data: pacienteDoc.data() };
    }
  
    throw new Error('Usuario no encontrado en ninguna colección');
  }
  
  getCurrentUserData(): Observable<any> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          const uid = user.uid;
  
          // Intentar obtener el usuario de la colección de administradores
          return this.afs.doc(`administradores/${uid}`).valueChanges().pipe(
            switchMap(admin => {
              if (admin) {
                return of({ role: 'admin', data: { ...admin, uid } });
              } else {
                // Intentar obtener el usuario de la colección de especialistas
                return this.afs.doc(`especialistas/${uid}`).valueChanges().pipe(
                  switchMap(especialista => {
                    if (especialista) {
                      return of({ role: 'especialista', data: { ...especialista, uid } });
                    } else {
                      // Intentar obtener el usuario de la colección de pacientes
                      return this.afs.doc(`pacientes/${uid}`).valueChanges().pipe(
                        switchMap(paciente => {
                          if (paciente) {
                            return of({ role: 'paciente', data: { ...paciente, uid } });
                          } else {
                            // Si no se encuentra en ninguna colección, retornar null
                            return of(null);
                          }
                        })
                      );
                    }
                  })
                );
              }
            })
          );
        } else {
          // Si no hay un usuario autenticado, retornar null
          return of(null);
        }
      })
    );
  }
  

  async isTurnoTaken(specialistId: string, date: Date, time: Date): Promise<boolean> {
    const startOfTurno = new Date(date);
    startOfTurno.setHours(time.getHours(), time.getMinutes(), 0, 0);

    const endOfTurno = new Date(startOfTurno);
    endOfTurno.setMinutes(startOfTurno.getMinutes() + 30);

    const turnos = await this.afs.collection('turnos', ref =>
      ref.where('especialista', '==', specialistId)
        .where('turno', '==', startOfTurno)
    ).get().toPromise();

    return !turnos?.empty;
  }

  saveTurno(turno: { specialistId: string; specialty: string; date: Date; time: Date; pacienteId: string }) {
    const turnoData = {
      especialista: turno.specialistId,
      especialidad: turno.specialty,
      turno: turno.time,
      creado: new Date(),
      pacienteId: turno.pacienteId,
      estado: 'pendiente' // Agrega el estado inicial del turno
    };
    return this.afs.collection('turnos').add(turnoData);
  }
  
  async getPacienteData(uid: string): Promise<any> {
    try {
      const doc = await this.afs.collection('pacientes').doc(uid).ref.get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error('Error al obtener datos del paciente:', error);
      throw error;
    }
  }
  
  async cancelarTurno(turnoId: string, comentario: string): Promise<void> {
    try {
      await this.afs.collection('turnos').doc(turnoId).update({
        estado: 'cancelado',
        comentarioCancelacion: comentario
      });
    } catch (error) {
      console.error('Error al cancelar el turno:', error);
      throw error;
    }
  }

  async getAllTurnos(): Promise<any[]> {
    try {
      const snapshot = await this.afs.collection('turnos').get().toPromise();
      if (!snapshot) {
        throw new Error('No se encontraron turnos');
      }
      return snapshot.docs.map(doc => {
        const data = doc.data() as Record<string, any>;
        return { id: doc.id, ...data };
      });
    } catch (error) {
      console.error('Error al obtener los turnos:', error);
      throw error;
    }
  }

  async getTurnosByPaciente(pacienteId: string): Promise<any[]> {
    try {
      const snapshot = await this.afs.collection('turnos', ref => ref.where('pacienteId', '==', pacienteId)).get().toPromise();
      if (!snapshot) {
        throw new Error('No se encontraron turnos para este paciente');
      }
      return snapshot.docs.map(doc => {
        const data = doc.data() as Record<string, any>;
        return { id: doc.id, ...data };
      });
    } catch (error) {
      console.error('Error al obtener los turnos del paciente:', error);
      throw error;
    }
  }
  
  async getTurnosByEspecialista(uid: string): Promise<any[]> {
    try {
      const snapshot = await this.afs.collection('turnos', ref => ref.where('especialista', '==', uid)).get().toPromise();
      if (!snapshot) {
        throw new Error('No se encontraron turnos para el especialista');
      }
      return snapshot.docs.map(doc => {
        const data = doc.data() as Record<string, any>;
        return { id: doc.id, ...data };
      });
    } catch (error) {
      console.error('Error al obtener los turnos del especialista:', error);
      throw error;
    }
  }

  async rechazarTurno(turnoId: string, comentario: string): Promise<void> {
    try {
      await this.afs.collection('turnos').doc(turnoId).update({
        estado: 'rechazado',
        comentarioRechazo: comentario
      });
    } catch (error) {
      console.error('Error al rechazar el turno:', error);
      throw error;
    }
  }
  
  async aceptarTurno(turnoId: string): Promise<void> {
    try {
      await this.afs.collection('turnos').doc(turnoId).update({
        estado: 'aceptado'
      });
    } catch (error) {
      console.error('Error al aceptar el turno:', error);
      throw error;
    }
  }
  
  async finalizarTurno(turnoId: string, comentario: string): Promise<void> {
    try {
      await this.afs.collection('turnos').doc(turnoId).update({
        estado: 'realizado',
        comentarioFinalizacion: comentario
      });
    } catch (error) {
      console.error('Error al finalizar el turno:', error);
      throw error;
    }
  }
  
  async completarEncuesta(turnoId: string, comentario: string): Promise<void> {
    try {
      await this.afs.collection('turnos').doc(turnoId).update({
        encuestaCompleta: true,
        encuestaComentario: comentario
      });
    } catch (error) {
      console.error('Error al completar la encuesta:', error);
      throw error;
    }
  }

  async calificarAtencion(turnoId: string, calificacion: number): Promise<void> {
    try {
      await this.afs.collection('turnos').doc(turnoId).update({
        calificacionAtencionCompleta: true,
        calificacionAtencion: calificacion
      });
    } catch (error) {
      console.error('Error al calificar la atención:', error);
      throw error;
    }
  }

  async cargarHistoriaClinica(turnoId: string, historiaClinica: any): Promise<void> {
    try {
      // Suponiendo que tienes una colección 'turnos' en Firestore
      const turnoRef = this.afs.collection('turnos').doc(turnoId);
      await turnoRef.update({
        historiaClinica: historiaClinica
      });
    } catch (error) {
      console.error('Error al cargar la historia clínica:', error);
      throw error;
    }
  }

  async getHistoriasClinicasByPaciente(uid: string): Promise<any[]> {
    if (!uid) {
      throw new Error('El uid del paciente es indefinido');
    }

    try {
      const snapshot = await this.afs.collection('turnos', ref => 
        ref.where('pacienteId', '==', uid).where('historiaClinica', '!=', null)
      ).get().toPromise();

      return snapshot?.docs.map(doc => {
        const data = doc.data() as any;
        return {
          ...data.historiaClinica,
          especialidad: data.especialidad // Asegúrate de que el campo especialidad esté presente en el documento
        };
      }) || [];
    } catch (error: any) {
      if (error.code && error.code === 'failed-precondition') {
        console.error('El índice requerido no existe. Por favor, crea el índice en Firestore.', error);
      } else {
        console.error('Error al obtener las historias clínicas:', error);
      }
      throw error;
    }
  }

  async getAllEspecialistasMap(): Promise<Map<string, string>> {
    try {
      const snapshot = await this.afs.collection('especialistas').get().toPromise();
      const especialistasMap = new Map<string, string>();
      snapshot?.docs.forEach(doc => {
        const data = doc.data() as Record<string, any>;
        especialistasMap.set(doc.id, data["nombre"]); // Asegurarnos de acceder a la propiedad 'nombre' correctamente con notación de corchetes
      });
      return especialistasMap;
    } catch (error) {
      console.error('Error al obtener los especialistas:', error);
      throw error;
    }
  }
  
  async getPacientesAtendidosPorEspecialista(especialistaId: string): Promise<any[]> {
    try {
        const snapshot = await this.afs.collection('turnos', ref =>
            ref.where('especialista', '==', especialistaId)
               .where('estado', '==', 'realizado')
        ).get().toPromise();
        
        const pacientesMap = new Map<string, any>();
        
        snapshot?.docs.forEach(doc => {
            const data = doc.data() as Record<string, any>;
            const pacienteId = data['pacienteId'];
            if (!pacientesMap.has(pacienteId)) {
                pacientesMap.set(pacienteId, { id: pacienteId, nombre: '', foto1: '', consultas: [] });
            }
            const paciente = pacientesMap.get(pacienteId);
            paciente.consultas.push({
                fecha: data['turno'].toDate().toISOString(),
                especialidad: data['especialidad'],
                comentario: data['comentarioFinalizacion']
            });
        });

        // Ordenar las consultas por fecha de manera descendente
        pacientesMap.forEach(paciente => {
            paciente.consultas.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        });

        // Recuperar los datos adicionales de los pacientes
        const pacientes = await Promise.all(Array.from(pacientesMap.keys()).map(async id => {
            const pacienteDoc = await this.afs.collection('pacientes').doc(id).get().toPromise();
            const paciente = pacientesMap.get(id);
            if (pacienteDoc?.exists) {
                const pacienteData = pacienteDoc.data() as { nombre?: string, foto1?: string };
                paciente.nombre = pacienteData?.nombre || '';
                paciente.foto1 = pacienteData?.foto1 || '';
            }
            return paciente;
        }));

        return pacientes;
    } catch (error) {
        console.error('Error al obtener pacientes atendidos:', error);
        throw error;
    }
}

  
  
  

}
