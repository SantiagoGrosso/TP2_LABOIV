export class Especialista {
    nombre : any;
    apellido : any; 
    edad : any;
    DNI : any;
    especialidad : any;
    mail : any;
    password : any;
    foto1: any;    

    constructor(nombre : any,
        apellido : any,
        edad : any,
        DNI : any,
        especialidad : any,
        mail : any,
        password : any,
        foto1: any)
    {
        this.nombre = nombre
        this.apellido = apellido
        this.edad = edad
        this.DNI = DNI
        this.especialidad = especialidad
        this.mail = mail
        this.password = password
        this.foto1 = foto1;        
    }
}
