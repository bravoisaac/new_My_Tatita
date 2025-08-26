```bash 
  ionic serve
```

# MyTatita 🚀

Aplicación web fullstack desarrollada con **Laravel (backend)**, **Angular (frontend)** y **MySQL (base de datos)**.  
El proyecto está completamente dockerizado usando **Docker Compose**, por lo que puedes levantar todo el entorno con un solo comando.  

---

## 📦 Requisitos previos
- [Docker](https://www.docker.com/) ≥ 20.x
- [Docker Compose](https://docs.docker.com/compose/) ≥ 2.x
- (Opcional) Node.js y Composer instalados localmente para desarrollo sin Docker.

---

## ⚙️ Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/usuario/MyTatita.git
   cd MyTatita
   ```
2. Crea los proyectos de backend (Laravel) y frontend (Angular) si aún no existen:
   ```bash
  # Backend (Laravel)
  docker run --rm -v ${PWD}:/app composer create-project laravel/laravel backend
  
  # Frontend (Angular)
  npx @angular/cli new frontend --style=css --routing=true ```

3. 

4. 

5. 
