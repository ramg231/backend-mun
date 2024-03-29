import { z } from "zod";

export const registerSchmea = z.object({
    username : z.string({
        required_error : 'El usuario es requerido'
    }),
    email: z.string({
        required_error: 'el correo es requerido'
    }).email({
        message:'Correo Invalido'
    }),
    password: z.string({
        required_error: 'Correo es requerido'
    }).min(6,{
        message: 'La constraseña debe tener minimo 6 caracteres'
    })
})


export const loginSchmea = z.object({
    username : z.string({
        required_error : 'El usuario es requerido'
    }),
    password: z.string({
        required_error: 'Contraseña es requerida'
    }).min(6,{
        message: 'La constraseña debe tener minimo 6 caracteres'
    })
})