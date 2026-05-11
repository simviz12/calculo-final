# Sistema de Modelado Inverso y Análisis Multivariado de Errores en Redes Sísmicas (Caso Volcán Galeras)

Este software avanzado ha sido desarrollado para la asignatura de **Cálculo Multivariado** en la **Universidad Cooperativa de Colombia (Sede Pasto)**. El sistema integra simulación física 3D, procesamiento de señales ruidosas y visualización de campos escalares de error.

## 1. Título y Descripción de Alto Nivel
**Objetivo:** Desarrollar un software en React + Three.js que procese datos de una malla de 9 sensores inteligentes, aplique un modelo inverso para reconstruir una onda sísmica ideal y visualice la discrepancia mediante mapas de calor dinámicos.

## 2. Marco Teórico (Fundamentos Académicos)
- **Modelo de Datos:** Se basa en una función multivariada $f(x, y, t)$ que describe la superficie de una onda sísmica en un plano 2D con altura $Z$. Utilizamos una función de onda esférica con decaimiento:
  $$f(x, y, t) = A \cdot \frac{\cos(k \cdot r - \omega t)}{r} \cdot e^{-b \cdot r}$$
- **Ruido "Mausigno":** Implementación de una función de ruido Gaussiano (Box-Muller) que afecta a cada sensor de forma independiente, simulando la interferencia geológica y térmica del entorno volcánico.
- **Modelo Inverso:** Técnica matemática (Mínimos Cuadrados) para recuperar los parámetros originales del sismo (amplitud $A$) partiendo de datos contaminados con ruido:
  $$\min_{A} \sum_{i=1}^{9} (D_{obs}^{(i)} - f(x_i, y_i, t, A))^2$$

## 3. Arquitectura del Software (Stack Técnico)
- **Frontend:** React.js (Vite) para la interfaz reactiva y gestión de estados globales.
- **Motor 3D:** React Three Fiber (R3F) y Three.js para la renderización de la malla topográfica y los nodos sensores.
- **Visualización:** Interpolación de Distancia Inversa (IDW) para la generación de la Superficie de Error (Heatmap).

## 4. Funcionalidades del Sistema (Resumen Maestro)
1.  **Generador Sísmico Ideal:** Ecuación de onda esférica calibrada para el Volcán Galeras.
2.  **Red de 9 Sensores Inteligentes:** Matriz 3x3 con perfiles de ruido diferenciados y detección de fallos locales.
3.  **Modelo Inverso en Tiempo Real:** Algoritmo de Mínimos Cuadrados para estimación de amplitud $A$.
4.  **Mapa de Calor 3D Dinámico:** Superficie que se deforma y cambia de color según el campo de error.
5.  **Mapa Estático XY (2D):** Visualización superior en una esquina del sistema que muestra el error en puntos (sensores) y el gradiente de temperatura/error en el plano.
6.  **Análisis de Gradientes ($\nabla f$):** Visualización vectorial de la propagación de energía sísmica.
7.  **Epicentro Interactivo (Drag & Drop):** Posibilidad de mover el origen del sismo manualmente en el mapa 3D.
8.  **Dashboard Estadístico:** Panel inferior con métricas de error promedio, estado de convergencia y diagramas 2D.
9.  **Exportación UCC:** Generación automática de reportes CSV con el formato oficial de la sede Pasto.

## 5. El Escenario de Prueba: "Complejo Galeras"
El sistema carga por defecto una simulación calibrada para la región de Nariño:
- **Epicentro:** Localizado en la caldera principal $(0,0,0)$.
- **Malla de Sensores:** Matriz de $3 \times 3$ cubriendo un área de estudio de $10 \text{km} \times 10 \text{km}$.
- **Comparativa Crítica:** El sistema resalta la discrepancia entre el **Sensor 4 (Oeste)** y el **Sensor 6 (Este)** para analizar cómo fallas locales afectan la convergencia del modelo inverso.

---
### 6. Instalación y Uso
1. Clonar el repositorio.
2. Ejecutar `npm install`.
3. Iniciar con `npm run dev` y abrir `localhost:5173`.

---
*Software desarrollado por Carlos Julián Benavides Burbano para la Universidad Cooperativa de Colombia.*
