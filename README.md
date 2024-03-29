# Programa de Neuroentrenamiento en ReactJS

## Descripción del Programa

Este programa de neuroentrenamiento está diseñado para mejorar el rendimiento deportivo mediante una aplicación web construida con ReactJS. La aplicación actúa como el cliente del lado del servidor y está conectada directamente al servidor de detección mediante visión por computadora.

## Arquitectura del Software

La aplicación está estructurada en componentes y utiliza una arquitectura cliente-servidor para comunicarse con el servidor de detección mediante visión por computadora. Los datos se transmiten a través de una conexión segura entre el cliente y el servidor, utilizando un protocolo de comunicación estándar.

## Funcionamiento

El programa de neuroentrenamiento utiliza algoritmos y técnicas de neuroentrenamiento para mejorar el rendimiento deportivo de los usuarios. Los usuarios pueden cargar datos de entrada, procesarlos y visualizar los resultados en la aplicación web. Para ello, se pueden utilizar diferentes casos de uso, como la calibración del escenario o la detección automática de marcas.

## Requisitos del Sistema

Para utilizar el programa de neuroentrenamiento, es necesario tener instalada la última versión de Node.js y contar con el archivo .env que contiene las variables de entorno necesarias para la ejecución del programa.

## Instrucciones de Uso

Para utilizar el programa de neuroentrenamiento, sigue estos pasos detallados:

1. Clona el repositorio y asegúrate de tener todas las dependencias instaladas ejecutando `npm install`.
2. Ejecuta el comando `npm start` para iniciar la aplicación en modo de desarrollo.
3. Sigue las instrucciones en pantalla para cargar y procesar los datos de entrada.
4. Utiliza la función de calibración del escenario desde la ventana de sesiones de fútbol.
5. Utiliza la detección automática de marcas para analizar una sesión.

## Limitaciones y Recomendaciones

Este programa de neuroentrenamiento está diseñado para mejorar el rendimiento deportivo, pero puede tener algunas limitaciones según las características de los usuarios. Se recomienda seguir las instrucciones de uso y asegurarse de tener los requisitos del sistema necesarios.

## Instrucciones para Desarrolladores

En la carpeta `layouts` se encuentran las diferentes vistas de la aplicación.

Considerar:

* `AnalizeSession`: vista donde se analizan los resultados de las jugadas.
* `FootballSession`: vista principal al iniciar una sesión.
* `ListOfPlays`: muestra todas las jugadas guardadas.
* `Menu`: vista de menú.
* `OtherSessions`: vista donde se muestran las sesiones guardadas.
* `PlaysView`: vista para crear o editar jugadas.
* `Webapp`: vista de inicio de sesión.

Por otra parte, se encuentran los elementos de la carpeta `components` donde podemos encontrar:

* `Calibration`: componente para realizar la calibración de la cámara.
* `FootballSessionView`: componente donde se encuentran todas las animaciones que se muestran tanto al jugador como al entrenador.
* `FormPlayer`: componente de formulario para crear o editar jugadores.
* `Webcam`: componente de la cámara con la cual se grabará el video de la sesión.
* `WindowPortal`: componente para duplicar el componente `FootballSessionView` para que se pueda ver en una ventana distinta, pero el contenido se comparta en ambas.

Luego se tiene una carpeta de `connection` donde se encuentran 2 archivos:

* `Connect`: el cual tiene el CRUD básico de la API para luego llamarlo con una función.
* `Path`: este archivo posee las rutas referentes a la API.

En la carpeta `services` se encuentra un único archivo:

* `Context`: este componente se utiliza para tener acceso a variables globales que pueden ser llamadas desde cualquier archivo del programa.

Por último, tenemos la carpeta de `styles` donde se encuentran todos los archivos CSS correspondientes a cada componente o vista del programa los cuales tienen el mismo nombre al que corresponden.

Otros archivos relevantes son:

* `Dockerfile`: archivo para la creación y ejecución de la imagen de Docker que se ejecuta en el servidor AWS.

## Importante

Para la correcta ejecución del programa, se recuerda tener el archivo `.env` el cual tiene la siguiente estructura:

```plaintext
TOKEN=(Token para las peticiones de la API)
REACT_APP_APIMCP=(URL donde se expone la API)
REACT_APP_HEADER=(Header para las peticiones de la API)
REACT_APP_TOKEN=(Body del token dentro de la petición a la API)
REACT_APP_AWS_ACCESS_KEY_ID=(Key Id de AWS)
REACT_APP_AWS_SECRET_ACCESS_KEY=(Secret key para hacer peticiones a AWS)
REACT_APP_AWS_URL=(URL del bucket de AWS)
REACT_APP_VISIONMCP=(URL donde se expone el proyecto de Vision)
PORT=(Puerto donde se expondrá el proyecto de React)
```