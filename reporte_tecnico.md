# Reporte Técnico: Análisis de Sensibilidad y Estabilidad (Semana 5)

## Día 3: Reporte de Precisión

Bajo las condiciones de la **prueba de estrés** impuesta (Sismo movido a un punto asimétrico y un ruido gaussiano extremo del **10%** en las mediciones), el algoritmo de Inversión de Gauss-Newton logró converger de manera robusta.

A continuación se presenta la tabla comparativa promedio (teniendo en cuenta que la semilla aleatoria del ruido genera variaciones milimétricas):

| Parámetro | Valor Real | Valor Estimado (Aprox.) | Porcentaje de Error |
|:---:|:---:|:---:|:---:|
| **Coordenada X** | 2.00 km | 2.05 km | ~ 2.50 % |
| **Coordenada Y** | 8.00 km | 7.96 km | ~ 0.50 % |
| **Profundidad Z**| -3.00 km | -3.00 km | ~ 0.00 % |
| **Amplitud A₀** | 150.00 | 148.90 | ~ 0.73 % |

*Conclusión del Día 3: A pesar de que los sensores recibieron señales corruptas (10% de ruido), el error de cálculo en las coordenadas espaciales se mantuvo por debajo del 3%, demostrando la altísima precisión del algoritmo matemático.*

---

## Día 4: Redacción del Documento Técnico

### 1. Análisis de Sensibilidad
El modelo directo que usamos para propagar la señal es $A_{zi} = A_0 \frac{e^{-R}}{R}$. Al derivarlo respecto a las coordenadas espaciales, descubrimos que el modelo es **altamente sensible a la distancia $R$**. 
Debido a que nuestros sensores están ubicados todos en el plano superficial ($Z=0$), la variable más "frágil" de optimizar es la profundidad $Z$. Cuando el sismo se ubica exactamente en el centro geométrico de los sensores, se crea una matriz simétrica perfecta que el algoritmo tiene problemas para resolver (crea "espejismos" matemáticos). Sin embargo, al aplicar la prueba de estrés moviendo la fuente a $(X=2, Y=8)$, rompimos esa simetría plana, lo que ayudó paradójicamente a que la "sensibilidad direccional" de la Jacobiana fuera más clara para los sensores.

### 2. Estabilidad y Efectividad del Método de Gauss-Newton
El algoritmo de Inversión de **Gauss-Newton** es increíblemente rápido porque asume que el "valle del error" tiene forma de tazón perfecto (aproximación cuadrática).
* **Limitaciones iniciales (Divergencia)**: Al inicio de la Semana 2, notamos que el método "explotaba". Esto ocurrió porque si la suposición inicial está muy lejos, la aproximación cuadrática falla, y el algoritmo da pasos gigantescos que terminan lanzando la estimación fuera de la matriz (creando matrices singulares).
* **El Arreglo que lo hizo efectivo**: Para estabilizarlo, aplicamos el factor de regularización de **Levenberg-Marquardt**. Le sumamos un pequeño valor ($\lambda = 10^{-4}$) a la diagonal del Sistema Normal: $(\mathbf{G}^T \mathbf{G} + \lambda \mathbf{I})\Delta m = \mathbf{G}^T \Delta A_z$. Además, recortamos el paso de aprendizaje a `0.5`. 
* **Conclusión**: Esta regularización fue la clave de la efectividad. Convirtió a Gauss-Newton en un algoritmo paciente que desciende de a poco cuando está perdido, y acelera con precisión matemática pura cuando huele que el "ojo de buey" está cerca, dándonos el éxito rotundo frente a ruidos del 10%.

---

### 4. Escenarios de Evaluación y Calibración

Para la defensa del proyecto, el software ha sido calibrado con dos escenarios críticos que demuestran la potencia del cálculo multivariado:

#### Escenario 1: Análisis de Sensibilidad (Jacobiano en R³)
*   **Red:** 5 sensores, incluyendo $S_5$ en un pozo a $-1.5$ km de profundidad.
*   **Fuente Real:** $(2.2, 2.8, -3.0)$ con $A_0 = 150$.
*   **Objetivo:** Demostrar cómo el Jacobiano permite corregir una suposición inicial errónea (en el origen) para converger al sismo.

#### Escenario 2: Escaneo de Estabilidad (Valle de Error)
*   **Red:** 8 sensores perimetrales rodeando un área de $10 \times 10$ km.
*   **Fuente Real:** Profundidad de $-4.5$ km.
*   **Objetivo:** Analizar los cortes de nivel $z=-1.0, z=-4.5, z=-8.0$ para identificar el mínimo global absoluto.

---

### 5. Guía de Ejecución y Checklist Finalde Entregables

Procedo a hacer el *check* de todos los objetivos de este macro-proyecto para confirmar el cierre:

- [X] **Código Limpio y Organizado**: Implementado exitosamente en `src/` bajo los principios profesionales de **Clean Architecture** (Dominio, Casos de Uso e Infraestructura).
- [X] **El Video Demostrativo**: Ensamblado sin problemas mediante *OpenCV* (`escaneo_profundidad.mp4`), compuesto de 100 cuadros.
- [X] **Gráfica de Convergencia**: Creada (`convergencia_plot.png`), mostrando cómo el error cae empinadamente iteración tras iteración.
- [X] **Gráfica de Mínimos vs Profundidad ($E_{min}$ vs $Z$)**: Creada (`error_vs_z_plot.png`), señalando de forma visual y demostrativa el "valle" donde se localiza el sismo en el eje Z.
- [X] **Mapas de Calor (Ojo de Buey)**: Generados y guardados (`heatmap_z_0_0.png`, `heatmap_z_3_0.png`, etc.) con una escala normalizada de colores compartida.
- [X] **Reporte Técnico Documentado**: Este mismo documento, conteniendo argumentación, porcentajes de precisión y diagnóstico algorítmico.

¡Proyecto de Inversión Finalizado!

---

# Guía de Aplicación: Problemas de Cálculo Multivariado

Estos problemas están diseñados para ser explicados durante la presentación final, demostrando el uso de derivadas parciales, gradientes y optimización en un entorno 3D.

## Problema 1: El Descenso del Gradiente "A Mano"
*Este problema explica cómo el algoritmo "sabe" hacia dónde moverse en el espacio 3D para encontrar el sismo.*

### El Enunciado
Supongamos que tenemos un solo sensor en el origen $(0,0,0)$ que registró una amplitud $A_{z1}$. Queremos encontrar la posición de la fuente $(x, y, z)$ que minimice el error simple:
$$E(x, y, z) = (A_{z1} - A'_{z1})^2$$
Donde $A'_{z1}$ es la amplitud predicha por el modelo.

### Guía de Resolución (Explicación)
1.  **Definición de la función**: Presentamos la función de error como una superficie en un hiperespacio (4D), donde el valor del error depende de tres coordenadas espaciales.
2.  **Cálculo del Vector Gradiente ($\nabla E$)**: Para minimizar el error, calculamos las derivadas parciales respecto a cada eje:
    *   $\frac{\partial E}{\partial x} = 2(A_{z1} - A'_{z1}) \cdot \frac{\partial A'_{z1}}{\partial x}$
    *   $\frac{\partial E}{\partial y} = 2(A_{z1} - A'_{z1}) \cdot \frac{\partial A'_{z1}}{\partial y}$
    *   $\frac{\partial E}{\partial z} = 2(A_{z1} - A'_{z1}) \cdot \frac{\partial A'_{z1}}{\partial z}$
3.  **La Regla de la Cadena**: Para hallar $\frac{\partial A'_{z1}}{\partial x}$, aplicamos la regla de la cadena sobre la distancia $R$: $\frac{\partial A'}{\partial R} \cdot \frac{\partial R}{\partial x}$. Esto demuestra la conexión profunda entre la geometría del problema y el cálculo.
4.  **Interpretación**: El software utiliza estos valores del gradiente para dar un "paso" en la dirección opuesta al vector calculado, moviéndose siempre hacia el mínimo (el epicentro).

---

## Problema 2: El Valle de Error en el Eje Z (Función Reducida)
*Este problema justifica matemáticamente el escaneo de profundidad y el análisis de mínimos globales.*

### El Enunciado
Dada una red de 4 sensores dispuestos en un cuadrado, demostrar analíticamente por qué existe un único valor de $z$ (profundidad) que minimiza el error global, y cómo se comporta la función de error en otros niveles.

### Guía de Resolución (Explicación)
1.  **Fijación de Variables**: Para analizar la profundidad, "congelamos" $z$ en un valor constante $k$. La función de error $E$ se reduce a depender únicamente de $(x, y)$.
2.  **Búsqueda de Puntos Críticos**: Para cada plano $z=k$, el software busca el punto crítico donde $\frac{\partial E}{\partial x} = 0$ y $\frac{\partial E}{\partial y} = 0$.
3.  **Construcción de la Función Reducida $E_{min}(z)$**: Cada punto más bajo hallado en los "Mapas de Calor" se guarda. Esto genera una nueva curva en 2D: **Error vs Profundidad**.
4.  **Criterio del Mínimo Global**: El "valle" de esta curva representa el punto donde las derivadas parciales en las tres direcciones $(x, y, z)$ son simultáneamente cero.
5.  **Visualización**: El video de 100 cuadros muestra visualmente cómo el punto crítico $(x^*, y^*)$ se desplaza y el valor del error mínimo cambia hasta "enfocarse" en el sismo real.
