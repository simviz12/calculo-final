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

## 🔬 2. Escenario 1: El Sismo Urbano (Sensibilidad y Jacobiano)
**Haz clic en "Esc. 1" en el simulador.**

*   **Caso Real:** Se ha detectado un sismo inducido cerca de una **zona industrial**. Debido a las edificaciones, solo pudimos instalar 4 sensores en superficie, pero contamos con uno estratégico en un **pozo profundo de monitoreo ($S_5$)**.
*   **El Problema:** El sismo está oculto en $(2.2, 2.8, -3.0)$. Nuestra primera suposición es ciega (en el origen).
*   **Qué explicar:** "Profesor, en este caso real, el sensor del pozo es nuestra pieza clave. Sin él, el Jacobiano sería casi nulo en la dirección Z, y no podríamos saber si el sismo es superficial o profundo. $S_5$ nos da la 'ancla' vertical necesaria".

*   **Qué explicar**:
    1.  **Matrices Jacobianas**: Muestra cómo el software usa las derivadas parciales $\frac{\partial A}{\partial x}, \frac{\partial A}{\partial y}, \frac{\partial A}{\partial z}$ para ajustar la posición.
    2.  **La Importancia de $S_5$**: Explica que sin el sensor profundo, la sensibilidad en el eje Z sería muy pobre. El sensor en el pozo "tira" del algoritmo hacia abajo.
    3.  **Convergencia**: Observa en la consola de Python cómo el error baja de miles a casi cero en solo 5-10 iteraciones.

---

## 🌊 3. Escenario 2: Monitoreo de Zona de Subducción (Escaneo 3D)
**Haz clic en "Esc. 2" en el simulador.**

*   **Caso Real:** Estamos monitoreando una **zona de subducción** de alta importancia sísmica. Hemos rodeado el área con una red perimetral de 8 sensores para capturar cualquier movimiento profundo.
*   **El Problema:** Un sismo ocurre a gran profundidad (-4.5km). Necesitamos asegurar que el algoritmo no caiga en un "error falso" (mínimo local).
*   **Dinámica de la Presentación (Sigue estos pasos):**
    1.  **Z = -1.0km (Cerca de superficie)**: Mueve el slider de profundidad. Verás que el Mapa de Calor es una mancha difusa y el Valle 3D es muy plano. *Dile al profesor: "Aquí el gradiente es pequeño, el sistema tiene mucha incertidumbre".*
    2.  **Z = -4.5km (Punto Dulce)**: Mueve el slider. Verás el "Ojo de Buey" (negro/púrpura intenso) y un pico 3D muy afilado. *Dile: "Aquí hemos hallado el Mínimo Global. Todas las derivadas parciales se anulan simultáneamente".*
    3.  **Z = -8.0km (Pasamos el objetivo)**: Verás que el mapa se vuelve a aclarar. *Dile: "El error vuelve a subir, confirmando que la fuente está arriba".*

---

## 🏔️ 4. Escenario 3: La Falla de San Andrés (Alineación y Anisotropía)
**Haz clic en "Esc. 3" en el simulador.**

*   **Caso Real:** Imaginemos que estamos en una sección de una **falla geológica lineal** (como la de San Andrés). Por logística, los sensores se han colocado siguiendo el trazo de la falla (casi alineados).
*   **El Problema:** El sismo ocurre un poco desplazado de la línea de sensores.
*   **Reto Matemático (Incertidumbre)**: Al estar alineados, el sistema tiene un "punto ciego". El valle de error se vuelve un **elipsoide alargado**.
*   **Qué explicar**: "Profesor, aquí vemos que la precisión no es igual en todas las direcciones. El software nos muestra un 'pasillo de incertidumbre'. Esto es vital en ingeniería para saber cuánta confianza darle a la localización según cómo pusimos los sensores".

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
