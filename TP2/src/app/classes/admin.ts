export class Admin {
    nombre : any;
    apellido : any; 
    edad : any;
    DNI : any;    
    mail : any;
    password : any;
    foto1: any;    
    
    constructor(nombre : any,
        apellido : any,
        edad : any,
        DNI : any,        
        mail : any,
        password : any,
        foto1: any)
    {
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.DNI = DNI;        
        this.mail = mail;
        this.password = password;
        this.foto1 = foto1;        
    }
}
