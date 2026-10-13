'use client';

import { login, registerUser } from "@/actions";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type FormInputs = {
    name: string;
    email: string;
    password: string;
}

export const RegisterForm = () => {

    // const router = useRouter();
    const [errorMessage, setErrorMessage] = useState('');
    const { register, handleSubmit, formState: {errors} } = useForm<FormInputs>();

    const onSubmit: SubmitHandler<FormInputs> = async(data) => {
        const { name, email, password } = data;
        const res = await registerUser(name, email, password);

        if ( !res.ok ) {
            setErrorMessage(res.message);
            return;
        }

        await login(email.toLowerCase(), password);
        // router.replace('/');
        window.location.replace('/');
    }

  return (
    <form onSubmit={ handleSubmit(onSubmit) } className="flex flex-col">
        <label htmlFor="email">Nombre</label>
        <input
          className={clsx(
            "px-5 py-2 border bg-gray-200 rounded mb-5", 
            {
                'border-red-500': errors.name
            }
          )}
          type="text"
          autoFocus
          {...register('name', { required: true}) } 
          />

        <label htmlFor="email">Correo electrónico</label>
        <input
          className={clsx(
            "px-5 py-2 border bg-gray-200 rounded mb-5", 
            {
                'border-red-500': errors.email
            }
          )}
          type="email" 
          autoFocus
          {...register('email', { required: true, pattern: /^\S+@\S+$/i })} 
          />


        <label htmlFor="password">Contraseña</label>
        <input
          className={clsx(
            "px-5 py-2 border bg-gray-200 rounded mb-5", 
            {
                'border-red-500': errors.password
            }
          )}
          type="password"
          autoFocus 
          {...register('password', {required: true, minLength: 6})} />


        <span className="text-red-500">{errorMessage}</span>
        <button
          
          className="btn-primary">
          Crear Cuenta
        </button>


        {/* divisor l ine */ }
        <div className="flex items-center my-5">
          <div className="flex-1 border-t border-gray-500"></div>
          <div className="px-2 text-gray-800">O</div>
          <div className="flex-1 border-t border-gray-500"></div>
        </div>

        <Link
          href="/auth/login" 
          className="btn-secondary text-center">
          Iniciar Sesión
        </Link>

      </form>
  )
}
