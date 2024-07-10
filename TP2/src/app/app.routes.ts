import { Routes } from '@angular/router';
import { BienvenidaComponent } from './components/bienvenida/bienvenida.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { RegistroEspecialistasComponent } from './components/registro-especialistas/registro-especialistas.component';
import { RegistroPacientesComponent } from './components/registro-pacientes/registro-pacientes.component';
import { EspecialidadesComponent } from './components/especialidades/especialidades.component';
import { BotonesInicioComponent } from './components/botones-inicio/botones-inicio.component';
import { SeccionUsuariosComponent } from './components/seccion-usuarios/seccion-usuarios.component';
import { RegistroAdminsComponent } from './components/registro-admins/registro-admins.component';
import { HabilitarEspecialistasComponent } from './components/habilitar-especialistas/habilitar-especialistas.component';
import { MiPerfilComponent } from './components/mi-perfil/mi-perfil.component';
import { SolicitarTurnosComponent } from './components/solicitar-turnos/solicitar-turnos.component';
import { TurnosComponent } from './components/turnos/turnos.component';
import { MisTurnosPacComponent } from './components/mis-turnos-pac/mis-turnos-pac.component';
import { MisTurnosEspComponent } from './components/mis-turnos-esp/mis-turnos-esp.component';
import { SeccionPacientesComponent } from './components/seccion-pacientes/seccion-pacientes.component';

export const routes: Routes = [
    {
        path: "bienvenida",
        component: BienvenidaComponent
    },

    { path: '', redirectTo: '/bienvenida', pathMatch: 'full' },

    {
        path: "login",
        component: LoginComponent
    },

    {
        path: "registro",
        component: RegistroComponent
    },
    {
        path: "registro_especialistas",
        component: RegistroEspecialistasComponent
    },
    {
        path:"registro_pacientes",
        component: RegistroPacientesComponent
    },
    {
        path:"especialidades",
        component: EspecialidadesComponent
    },
    {
        path:"botones",
        component: BotonesInicioComponent
    },
    {
        path:"seccion-usuarios",
        component: SeccionUsuariosComponent
    },
    {
        path:"registro_admins",
        component: RegistroAdminsComponent
    },
    {
        path:"habilitar-especialistas",
        component: HabilitarEspecialistasComponent
    },
    {
        path:"mi-perfil",
        component: MiPerfilComponent
    },
    {
        path:"solicitar-turnos",
        component: SolicitarTurnosComponent
    },
    {
        path:"turnos",
        component: TurnosComponent
    },
    {
        path:"mis-turnos-pac",
        component: MisTurnosPacComponent
    },
    {
        path:"mis-turnos-esp",
        component: MisTurnosEspComponent
    },
    {
        path:"seccion-pacientes",
        component: SeccionPacientesComponent
    }
];
