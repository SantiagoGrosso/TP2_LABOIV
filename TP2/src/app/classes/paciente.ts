export class Paciente {
    nombre : any;
    apellido : any; 
    edad : any;
    dni : any;
    obraSocial : any;
    mail : any;
    password : any;
    foto1: any;
    foto2: any;

    constructor(nombre : any,
        apellido : any,
        edad : any,
        dni : any,
        obraSocial : any,
        mail : any,
        password : any,
        foto1: any,
        foto2: any,)
    {
        this.nombre = nombre
        this.apellido = apellido
        this.edad = edad
        this.dni = dni
        this.obraSocial = obraSocial
        this.mail = mail
        this.password = password
        this.foto1 = foto1;
        this.foto2 = foto2;
    }
}
