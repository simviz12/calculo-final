# 🌋 Seismic Localization Simulator - Guía Maestra de Presentación

Este simulador es una herramienta de ingeniería avanzada diseñada para resolver el **Problema Inverso de Localización Sísmica** utilizando Cálculo Multivariado y Optimización No Lineal. Esta guía te servirá como guion para impresionar al profesor.

---

## 🏛️ 1. Fundamentos Matemáticos (El "Por Qué")
Antes de mostrar los gráficos, menciona estos tres pilares que están ocurriendo "bajo el capó":

*   **El Modelo Directo**: Usamos la función de atenuación $A(x,y,z) = A_0 \frac{e^{-R}}{R}$, donde $R$ es la distancia euclidiana en $\mathbb{R}^3$.
    $R = \sqrt{(x_s - x_i)^2 + (y_s - y_i)^2 + (z_s - z_i)^2}$

*   **La Función de Error (Energía)**: El software busca minimizar $E(m) = \sum [A_{obs} - A_{calc}(m)]^2$. Esta es una superficie en 4D que proyectamos en el simulador.
*   **El Descenso del Gradiente (Gauss-Newton)**: El algoritmo calcula el vector gradiente $\nabla E$ para saber en qué dirección "caer" hacia el epicentro real.

---

## 🔬 2. Escenario 1: Análisis de Sensibilidad y Jacobiano
**Haz clic en "Escenario 1" en el simulador.**

*   **El Problema**: El sismo está en $(2.2, 2.8, -3.0)$. Tenemos 5 sensores, pero uno ($S_5$) está a -1.5km de profundidad.
*   **Qué explicar**:
    1.  **Matrices Jacobianas**: Muestra cómo el software usa las derivadas parciales $\frac{\partial A}{\partial x}, \frac{\partial A}{\partial y}, \frac{\partial A}{\partial z}$ para ajustar la posición.
    2.  **La Importancia de $S_5$**: Explica que sin el sensor profundo, la sensibilidad en el eje Z sería muy pobre. El sensor en el pozo "tira" del algoritmo hacia abajo.
    3.  **Convergencia**: Observa en la consola de Python cómo el error baja de miles a casi cero en solo 5-10 iteraciones.

---

## 🌊 3. Escenario 2: El Escaneo del Valle de Error
**Haz clic en "Escenario 2" en el simulador.**

*   **El Problema**: Sismo profundo (-4.5km) bajo una red de 8 sensores perimetrales.
*   **Dinámica de la Presentación (Sigue estos pasos):**
    1.  **Z = -1.0km (Cerca de superficie)**: Mueve el slider de profundidad. Verás que el Mapa de Calor es una mancha difusa y el Valle 3D es muy plano. *Dile al profesor: "Aquí el gradiente es pequeño, el sistema tiene mucha incertidumbre".*
    2.  **Z = -4.5km (Punto Dulce)**: Mueve el slider. Verás el "Ojo de Buey" (negro/púrpura intenso) y un pico 3D muy afilado. *Dile: "Aquí hemos hallado el Mínimo Global. Todas las derivadas parciales se anulan simultáneamente".*
    3.  **Z = -8.0km (Pasamos el objetivo)**: Verás que el mapa se vuelve a aclarar. *Dile: "El error vuelve a subir, confirmando que la fuente está arriba".*

---

## 🏔️ 4. Escenario 3: Incertidumbre en Falla (Avanzado)
**Haz clic en "Esc. 3" en el simulador.**

*   **El Problema**: Los sensores están alineados casi en una diagonal (simulando una red a lo largo de una falla geológica).
*   **Reto Matemático (Anisotropía)**: Al estar los sensores alineados, el valle de error no es un círculo perfecto, sino un **elipsoide alargado**.
*   **Qué explicar**: "Profesor, aquí el Jacobiano nos muestra que la matriz de información es mal condicionada en una dirección. Esto demuestra que la geometría de la red de sensores dicta la precisión del cálculo multivariado".

---


## 📊 4. Interpretación de Gráficos (Dual View)
*   **Mapa de Calor (2D)**: Es una representación de las **curvas de nivel** de la función de error. El punto más oscuro es el epicentro probable.
*   **Topografía de Error (3D)**: Es la visualización de la **superficie de costo**. El algoritmo se comporta como una bola que rueda hacia el agujero más profundo.

---

## ❓ 5. Posibles Preguntas del Profesor
| Pregunta | Respuesta Pro |
| :--- | :--- |
| **¿Por qué usas Logaritmo en el eje Z de la gráfica?** | Para resaltar el valle de error. Sin logaritmo, los errores grandes aplastarían visualmente el detalle del mínimo. |
| **¿Cómo manejas el ruido del 10%?** | Implementamos una **Regularización** (tipo Levenberg-Marquardt) que evita que el algoritmo oscile locamente cuando los datos están sucios. |
| **¿Qué pasa si solo tienes 3 sensores?** | El sistema se vuelve "indeterminado". Matemáticamente, tendríamos infinitas soluciones posibles (un círculo de error). Necesitamos al menos 4 para una posición 3D única. |

---

## 🛠️ Comandos de Ejecución
1.  **Dashboard (Interactivo):** `cd dashboard` -> `npm run dev` (Abre `http://localhost:5173/`).
2.  **Motor Matemático (Cálculo):** `python src/main.py` (Genera el reporte de precisión final).
3.  **Video de Apoyo:** Mira `escaneo_profundidad.mp4` en la carpeta raíz.

---
*Este proyecto demuestra que el Cálculo Multivariado no es solo teoría, es la base de la seguridad sísmica moderna.*
