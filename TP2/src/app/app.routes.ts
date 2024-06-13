import { Routes } from '@angular/router';
import { BienvenidaComponent } from './components/bienvenida/bienvenida.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { RegistroEspecialistasComponent } from './components/registro-especialistas/registro-especialistas.component';
import { RegistroPacientesComponent } from './components/registro-pacientes/registro-pacientes.component';
import { EspecialidadesComponent } from './components/especialidades/especialidades.component';

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
];
