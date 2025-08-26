# MyTatita 🚀

Aplicación web full‑stack con **Angular (frontend)**, **Laravel (backend)** y **MySQL** (base de datos), todo orquestado con **Docker Compose**.

> Objetivo: poder clonar el repo, levantar contenedores y tener el front consumiendo una API REST de Laravel en minutos.

---

## 📦 Requisitos previos

* **Docker** ≥ 20.x
* **Docker Compose** ≥ 2.x (viene con Docker Desktop)
* *(Opcional)* **Node.js** ≥ 20.x y **Composer** si deseas correr servicios fuera de Docker.

---

## 🧭 Estructura del proyecto

```
MyTatita/
├─ backend/                 # Código Laravel (PHP)
│  ├─ Dockerfile            # Imagen del backend (Apache + PHP 8.2)
│  └─ ...
├─ frontend/                # Código Angular (TypeScript)
│  ├─ Dockerfile            # Imagen del frontend (Node 18)
│  └─ ...
├─ docker-compose.yml       # Orquestación de servicios
└─ README.md                # Este archivo
```

---

## ⚙️ Instalación (primera vez)

1. **Clonar el repositorio**

```bash
git clone https://github.com/usuario/MyTatita.git
cd MyTatita
```

2. **(Si no existe) Crear esqueleto de proyectos**

> Puedes omitir esta sección si ya subiste el código a `backend/` y `frontend/`.

**Laravel (backend)** — usando contenedor de Composer:

```bash
docker run --rm -v ${PWD}/backend:/app composer create-project laravel/laravel .
```

**Angular (frontend)** — usando Angular CLI:

```bash
cd frontend
npx @angular/cli new . --style=css --routing=true --directory=.
# Si la carpeta no está vacía, usa un nombre y luego mueve archivos:
# npx @angular/cli new myfrontend --style=css --routing=true
# mv myfrontend/* myfrontend/.* .  (en Windows, mueve manualmente)
cd ..
```

3. **Copiar y configurar variables de entorno de Laravel**

```bash
cp backend/.env.example backend/.env
```

Edita `backend/.env` para apuntar a MySQL del Compose:

```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=laravel
DB_PASSWORD=laravel
```

4. **Asegurar comando de Angular para Docker**

En `frontend/package.json` ajusta el script `start`:

```json
{
  "scripts": {
    "start": "ng serve --host 0.0.0.0 --port 4200",
    "build": "ng build"
  }
}
```

---

## 🐳 Docker Compose

Crea/ajusta `docker-compose.yml` en la raíz del repo:

```yaml
version: "3.8"
services:
  laravel:
    build:
      context: ./backend
    container_name: laravel-app
    volumes:
      - ./backend:/var/www/html
    ports:
      - "8000:80"
    depends_on:
      - mysql

  mysql:
    image: mysql:8
    container_name: mysql-db
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: laravel
      MYSQL_USER: laravel
      MYSQL_PASSWORD: laravel
    ports:
      - "3307:3306"   # usa 3307 en host para evitar conflicto con MySQL local
    volumes:
      - mysql_data:/var/lib/mysql

  angular:
    build:
      context: ./frontend
    container_name: angular-app
    command: ng serve --host 0.0.0.0 --port 4200
    volumes:
      - ./frontend:/usr/src/app:cached
      - /usr/src/app/node_modules   # evita mezclar node_modules del host (Windows) con Linux
    ports:
      - "4200:4200"

volumes:
  mysql_data:
```

### `backend/Dockerfile` (Laravel)

```dockerfile
FROM php:8.2-apache

# Dependencias del sistema
RUN apt-get update && apt-get install -y \
    libpng-dev libonig-dev libxml2-dev \
    zip unzip git curl && rm -rf /var/lib/apt/lists/*

# Extensiones PHP necesarias
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Habilitar mod_rewrite para Laravel
RUN a2enmod rewrite

WORKDIR /var/www/html
COPY . .

# Permisos recomendados para storage y cache
RUN chown -R www-data:www-data /var/www/html \
  && chmod -R 755 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80
CMD ["apache2-foreground"]
```

### `frontend/Dockerfile` (Angular)

```dockerfile
FROM node:18

WORKDIR /usr/src/app

# Instalar dependencias primero (aprovecha cache de capas)
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

EXPOSE 4200
CMD ["npm", "start"]
```

---

## ▶️ Puesta en marcha

Desde la raíz del proyecto:

```bash
docker-compose up -d --build
```

Servicios:

* **Frontend (Angular)** → [http://localhost:4200/](http://localhost:4200/)
* **Backend (Laravel)** → [http://localhost:8000/](http://localhost:8000/)
* **MySQL** (para Workbench desde host) → host `127.0.0.1`, puerto `3307`, usuario `laravel`, pass `laravel`

> **Nota**: Dentro de Docker, Laravel se conecta a `mysql:3306` (no uses 3307 dentro de contenedores).

---

## 🗄️ Migraciones de base de datos

Una vez que MySQL esté *Up*, corre:

```bash
docker exec -it laravel-app php artisan migrate
```

---

## 🔌 API de ejemplo

Agrega en `backend/routes/api.php`:

```php
use Illuminate\Support\Facades\Route;
use App\Models\User;

Route::get('/users', function () {
    return User::all();
});
```

Prueba en el navegador/Postman:

```
GET http://localhost:8000/api/users
```

---

## 🌐 Consumir la API desde Angular

Crea `frontend/src/app/services/api.service.ts`:

```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'http://localhost:8000/api';
  constructor(private http: HttpClient) {}
  getUsers(): Observable<any> { return this.http.get(`${this.apiUrl}/users`); }
}
```

Usa el servicio en `app.component.ts` para listar usuarios:

```ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  template: `
    <h1>Usuarios</h1>
    <ul>
      <li *ngFor="let u of users">{{ u.name }} ({{ u.email }})</li>
    </ul>
  `
})
export class AppComponent implements OnInit {
  users: any[] = [];
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.getUsers().subscribe(d => this.users = d); }
}
```

> Asegúrate de tener importado `HttpClientModule` en tu módulo/standalone principal.

---

## 🛡️ CORS en Laravel

Instala middleware CORS para permitir el origen del frontend:

```bash
docker exec -it laravel-app composer require fruitcake/laravel-cors
```

En `config/cors.php` (o `.env`), permite `http://localhost:4200`:

```php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:4200'],
```

---

## 🧪 Comandos útiles

```bash
# Ver contenedores activos
docker ps

# Logs en tiempo real
docker logs -f angular-app
docker logs -f laravel-app

# Reiniciar solo Angular/Laravel
docker-compose restart angular
docker-compose restart laravel

# Reconstruir imagen de un servicio
docker-compose build angular

# Entrar a un contenedor
docker exec -it angular-app sh
```

---

## 🆘 Troubleshooting

**ERR\_EMPTY\_RESPONSE en [http://localhost:4200](http://localhost:4200)**

* Asegúrate de que Angular **escucha en 0.0.0.0** (ver `command` del servicio o `npm start`).
* Verifica el mapeo de puertos `4200:4200` y que el contenedor está Up (`docker ps`).

**Error Rollup: `Cannot find module @rollup/rollup-linux-x64-gnu`**

* No montes `node_modules` del host dentro del contenedor. Mantén la línea `- /usr/src/app/node_modules` en `volumes:` para usar módulos nativos de Linux dentro de Docker.
* Si cambiaste versiones de Node/Angular: borra `node_modules` y `package-lock.json` (en el host) y reconstruye la imagen `angular`.

**Puerto 3306 ocupado**

* Usa `3307:3306` en `mysql` (como en este repo) o libera el 3306 local.

**Laravel no conecta a MySQL**

* Corre migraciones cuando `mysql-db` ya esté *healthy*.
* En `.env` usa `DB_HOST=mysql` y `DB_PORT=3306` (no 3307).

---

## 🤝 Contribuir

1. Fork del repo
2. Crea una rama: `git checkout -b feature/mi-feature`
3. Commit: `git commit -m "feat: agrega mi feature"`
4. Push: `git push origin feature/mi-feature`
5. Abre Pull Request

---

## 📜 Licencia

[MIT](LICENSE)
