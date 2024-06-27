export class Especialista {
    nombre : any;
    apellido : any; 
    edad : any;
    dni : any;
    especialidad : any;
    mail : any;
    password : any;
    foto1: any;
    habilitado : boolean;    

    constructor(nombre : any,
        apellido : any,
        edad : any,
        dni : any,
        especialidad : any,
        mail : any,
        password : any,
        foto1: any,
        habilitado: boolean)
    {
        this.nombre = nombre
        this.apellido = apellido
        this.edad = edad
        this.dni = dni
        this.especialidad = especialidad
        this.mail = mail
        this.password = password
        this.foto1 = foto1;   
        this.habilitado = habilitado;     
    }
}
