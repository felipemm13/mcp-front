# Programa de neuroentrenamiento en ReactJS
## Introducción
Este es un programa de neuroentrenamiento diseñado para mejorar el rendimiento deportivo mediante una aplicación web construida con ReactJS. La aplicación funciona como el cliente del lado del servidor y está en conexión directa con el servidor de detección mediante visión por computador.

## Arquitectura del software
La aplicación está estructurada en componentes y utiliza una arquitectura de cliente-servidor para comunicarse con el servidor de detección mediante visión por computador. Los datos se transmiten a través de una conexión segura entre el cliente y el servidor, utilizando un protocolo de comunicación estándar.

## Funcionamiento
El programa de neuroentrenamiento utiliza algoritmos y técnicas de neuroentrenamiento para mejorar el rendimiento deportivo de los usuarios. Los usuarios pueden cargar datos de entrada, procesarlos y visualizar los resultados en la aplicación web. Para ello, se pueden utilizar diferentes casos de uso, como la calibración del escenario o la detección automática de marcas.

A continuación, se presentan un diagrama flujo que explican el funcionamiento de la calibración:

![Diagrama de flujo](src/images/diagrama.png)


## Requisitos del sistema
Para utilizar el programa de neuroentrenamiento, es necesario tener instalada la última versión de Node.js y el CLI de Firebase para poder alojar el proyecto. Puedes instalarlo utilizando el siguiente comando:


npm install -g firebase-tools
Recomendamos verificar la siguiente guía para obtener más información: https://dev.to/guillerbr/deploy-reactjs-on-firebase-hosting-4mpj

## Instrucciones de uso
Para utilizar el programa de neuroentrenamiento, sigue los siguientes pasos:

* Clona el repositorio y asegúrate de tener instaladas todas las dependencias ejecutando npm install.
* Ejecuta el comando npm start para iniciar la aplicación en modo de desarrollo.
* Sigue las instrucciones en la pantalla para cargar y procesar los datos de entrada.
* Utiliza la función de calibración del escenario desde la ventana de sesiones de futbol.
* Utiliza la detección automática de marcas para analizar una sesión.
* Limitaciones y recomendaciones
* Este programa de neuroentrenamiento está diseñado para mejorar el rendimiento deportivo, pero puede tener algunas limitaciones en función de las características de los usuarios. Recomendamos seguir las instrucciones de uso y asegurarse de tener los requisitos del sistema necesarios.

## Instrucciones Desarrollador

En la carpeta layouts se encontrarán las diferentes vistas de la aplicación donde en general cada vista de futbol tendrá su contraparte de taekwondo. 

Considerar:

* AnalizePlay vista donde se analizan los resultados de las jugadas.
* CreatePlay vista donde se pueden crear y editar jugadas que luego pueden ser utilizadas al momento de ejecutar el programa.
* Football/Taekwondo View es la vista principal al iniciar una sesión
* ListPlays muestra todas las jugadas guardadas
* ListSesions muestra las sesiones guardadas


Por otra parte se encuentan los elementos de la carpeta components donde podemos encontrar

* PlayersInZone/TaekwondoInZone que es la ventana donde se muestran las animaciones, considerar que solo la vista de futbol tuvo el cambio de biblioteca de animación.


### Subir cambios a Firebase

Considerando que se instaló el componente para firebase mencionado más arriba es necesario ejecutar lo siguiente:

* `firebase login` en caso de que sea la primera ejecución
* `firebase init hosting` en caso de que sea la primera ejecución
* `npm run build`
* `firebase deploy`
