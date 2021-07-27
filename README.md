# Vinilos-server

Backend REST API de la aplicación **Vinilos**.

## Descripción
El objetivo de esta esta aplicación es generar una red social para compartir Vinilos dentro de distintas comunidades.

## Alcance

El alcance actual del backend permite al usuario registrarse, confirar su correo electronico, cargar su perfil, registrarse en una comunidad y cambiar su contraseña.
Por otro lado permite al los usuarios seguir a otros miembros de la comunidad, cargar nuevos vinilos si este no existe y registrar un ejemplar en su biblioteca.  
Asimismo, permite al ususario ver los distintos ejemplares que hay dentro de la comunidad que esta registrado.

Dentro del las tareas administrativas, através de la API, un usuario con privilegios de administrador puede crear, modificar o eliminar paises, comunidades. Asiismo puede validar o bloquear cuentas de usario, fijar a un usuario determinado como administrador, etc.

Se adjunta dentro del repositorio el proyecto de postman donde estánn definidos todos los endpoints.


## Recostruir módulos de Node
```
npm install
```

## Generar carpeta de distribución
```
tsc -w
```

## Levantar servidor
```
nodemon dist/
```

ó

```
node dist/
```

## Base de datos

Se debe poder conectar a una base de datos **MongoDB**.

## Variables de Entorno

Se debe crear un archivo llamado ``.env`` que debe estar en la raiz del proyecto. El contenido de este archivo debe ser el siguiente:   

```textmate
NODE_ENV=
vinyl_api_port=
vinyl_api_db_connection_url=
vinyl_api_jwtPrivateKey=
vinyl_api_sendGridApiKey=
vinyl_api_sendGridFromEmail=
``` 

> **NOTA:** Para desarrollo, setear la variable de entorno NODE_ENV=development

## Configuracion

Para la configuracion del sistema se utilizó la librería [config](https://www.npmjs.com/package/config), haciendo uso de dos archivos de configuracion:

* ``config\custom-environment-variabes.json``

    Este archivo hace el mapeo con las variables de entorno para ser utilizadas en el archivo de configuración 

    ```json5
        {
           "SERVER_PORT": "vinyl_api_port",
           "DB_CONNECTION_URL": "vinyl_api_db_connection_url",
           "jwt": {
                   "JWT_PRIVATE_KEY": "vinyl_api_jwtPrivateKey"
                   },
           "notification": {
                             "NOT_BASE_URL": "vinyl_api_notBaseUrl"
                            },
           "sendGrid": {
                        "SEND_GRID_API_KEY": "vinyl_api_sendGridApiKey",
                        "SEND_GRID_FROM_EMAIL": "vinyl_api_sendGridFromEmail"
                        }
        }
    ```

  * ``config\default.json``

      ```json5
         {
           "SERVER_PORT": 3000,
           "DB_CONNECTION_URL": "",
           "logger": {
                      "LOG_FILE": "logs/vinyl_backend.log",
                      "LOG_FILE_EXCEPTIONS": "logs/vinyl_backend_exceptions.log",
                      "LOG_GENERAL_LEVEL": "info",
                      "LOG_FILE_LEVEL": "warm",
                      "LOG_FILE_EXCEPTIONS_LEVEL": "error"
                      },
           "jwt": {
                   "JWT_PRIVATE_KEY": "",
                   "JWT_AUTH_EXPIRES_IN": 3600,
                   "JWT_NOT_EXPIRES_IN": 172800
                  },
           "notification": {
                            "NOT_BASE_URL": "http://localhost:4200/#"
                           },
           "sendGrid": {
                        "SEND_GRID_API_KEY": "",
                        "SEND_GRID_FROM_EMAIL": ""
                       },
           "uploads": {
                        "IMG_NOT_FOUND_PATH": "../assets/no-img.jpg",
                        "IMG_USERS_PATH": "../uploads/users"
                       },
           "pagination": {
                          "DEFAULT_PAGE_SIZE": 25
                         },
           "passwordComplexityOptions": {
                                         "min": 8,
                                         "max": 30,
                                         "lowerCase": 1,
                                         "upperCase": 1,
                                         "numeric": 1,
                                         "symbol": 1,
                                         "requirementCount": 4
                                         }
          }
    ```

    > **NOTA:** Los valores sensibles, ya sean API key, connections strings, password, etc. Son tomados de las variables de entorno y se deben dejar vacios tal cual se muestra en el ejemplo.

### Logger (winston)

Para el logueo de mensajes se utilizó la libreria [Winston](https://www.npmjs.com/package/winston)

* ``LOG_FILE`` - Ruta del archivo de logs de express (Default: 'logs/vinyls_backend.log')
* ``LOG_FILE_EXCEPTIONSs`` - Ruta del archivo de logs de excepciones (Default: 'logs/vinyls_backend_exceptions.log')
* ``LOG_GENRAL_LEVEL`` - Nivel de general de Errores. Salida por consola (Default: 'debug')
* ``LOG_FILE_LEVEL`` - Nivel de Errores que se van a guardar en archivo. (Default: 'warn')
* ``LOG_FILE_EXCEPTIONS_LEVEL`` - - Nivel de Error de excepciones que se van a guardar en archivo de log de excepciones. (Default: 'error')

> **Niveles de error Soportados**
> * ``error: 0``
> * ``warn: 1``
> * ``info: 2``
> * ``http: 3,``
> * ``verbose: 4``
> * ``debug: 5``
> * ``silly: 6``

### Envio de email (SendGrid)

Para el envío de emails se integró un servicio externo llamado [SendGrid](https://sendgrid.com/). Para hacer uso de este servicio se debe registrar, obtener una API Key y definir la casilla de correo del sender.  
Estos parámetros deben ser definidos en las variavles de entorno.
```textmate
vinyl_api_sendGridApiKey=
vinyl_api_sendGridFromEmail=
```


