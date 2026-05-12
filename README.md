# Proyecto: Localización de Fuente Sísmica (Problema Inverso)

Este software ha sido desarrollado para la asignatura de **Cálculo Multivariado** en la **Universidad Cooperativa de Colombia (Sede Pasto)**. El sistema permite estimar la posición real de un sismo $(x_0, y_0, z_0)$ y su amplitud $A_0$ a partir de datos simulados en una red de sensores.

## 1. Marco Teórico (Fundamentos Académicos)
El proyecto se basa en los siguientes modelos matemáticos extraídos de la guía oficial:

- **Modelo de Atenuación (Ec. 1):**
  $$A_{zi} = A_0 \cdot \frac{e^{-R_i}}{R_i} + \epsilon_i$$
  Donde $R_i$ es la distancia euclidiana 3D entre la fuente y la estación $i$.

- **Distancia Euclidiana (Ec. 2):**
  $$R_i = \sqrt{(x_i - x_0)^2 + (y_i - y_0)^2 + (z_i - z_0)^2}$$

- **Ruido Gaussiano (Ec. 3):**
  $\epsilon_i \sim N(0, \sigma^2)$, con $\sigma = \alpha \cdot A_{ideal}$. El parámetro $\alpha$ controla la intensidad del ruido.

- **Función de Error (Ec. 7):**
  Se busca minimizar la suma de los residuos al cuadrado:
  $$E_{rr} = \sum_{i=1}^{M} (A_{zi} - A'_{zi})^2$$

## 2. Arquitectura del Software
- **Frontend:** React.js + Vite.
- **Visualización 3D:** Three.js con React Three Fiber.
- **Cálculo Numérico:** Implementación de modelos multivariados para la generación de superficies de error.

## 3. Funcionalidades Principales
1.  **Simulación de Fuente 3D:** Control total sobre la posición $(x, y)$ mediante arrastre y profundidad $(z)$ mediante sliders.
2.  **Red de Estaciones:** Visualización de 9 sensores en superficie $(z=0)$ registrando amplitudes en tiempo real.
3.  **Análisis de Superficie de Error:** Visualización de la función $E(x, y)$ interpolada, permitiendo identificar visualmente el mínimo global.
4.  **Cálculo de RMS:** Monitoreo constante del error cuadrático medio de la red.
5.  **Reportes Académicos:** Generación de documentos Word con el formato requerido por la UCC, incluyendo los datos de las estaciones y parámetros de la fuente.

## 4. Instalación
1. Clonar el repositorio.
2. Ejecutar `npm install`.
3. Iniciar con `npm run dev`.

---
## 5. Guía de Sustentación (Para el Docente)

### Resumen de Avances Logrados
Al presentar este proyecto, puedes destacar los siguientes hitos técnicos:
1. **Implementación del Modelo Físico 3D**: "El sistema calcula la atenuación de la amplitud en el espacio tridimensional usando la distancia euclidiana $R = \sqrt{(x_i-x_0)^2 + (y_i-y_0)^2 + (z_i-z_0)^2}$, cumpliendo con la ecuación 2 del documento."
2. **Visualización de Campos Escalares de Error**: "Se desarrolló una malla dinámica que representa la **Función de Error $E(x, y)$**. Esto permite visualizar la formación de un 'valle' cuyo punto más bajo (mínimo global) indica la posición probable del sismo."
3. **Análisis de Sensibilidad a la Profundidad ($z$)**: "El software permite variar la profundidad $z_0$ para analizar cómo cambia la estructura de la función de error, cumpliendo con el objetivo de encontrar el valor de $z$ que minimiza el error global."
4. **Simulación de Ruido Realista**: "Se integró ruido gaussiano distribuido $(\epsilon \sim N(0, \sigma^2))$ proporcional a la amplitud ideal, garantizando que el problema de optimización responda a un escenario físico realista."

### Preguntas Claves del Trabajo (Análisis Multivariado)
Estas preguntas demuestran un dominio profundo de los conceptos matemáticos aplicados:

*   **¿Por qué la función de error se vuelve más 'plana' y difícil de minimizar a medida que el sismo es más profundo?**
    *   *Análisis:* A mayor profundidad (mayor $z$), la distancia $R$ a los sensores de superficie aumenta. En la ecuación de atenuación, el término $e^{-R}/R$ decae, lo que hace que las derivadas parciales respecto a $x$ e $y$ (el gradiente $\nabla E$) sean mucho más pequeñas. Geométricamente, el "valle" de error pierde pendiente.
*   **¿Es posible que existan mínimos locales si el ruido $\alpha$ es muy alto?**
    *   *Análisis:* Sí. Con poco ruido, la función objetivo tiene un mínimo global claro. Sin embargo, a medida que el parámetro $\alpha$ aumenta, el ruido distorsiona las observaciones $A_{zi}$, lo que "arruga" la superficie de error $E(x, y, z)$ y puede generar mínimos locales que atrapen a un algoritmo de optimización iterativo (como Gauss-Newton).
*   **¿Cómo afecta la geometría de la red de sensores a la precisión del modelo?**
    *   *Análisis:* La distribución geométrica de los sensores determina la estructura del Jacobiano $G$. Si todos los sensores estuvieran alineados o muy juntos, el problema estaría mal condicionado geométricamente, haciendo que pequeños errores en las lecturas se amplifiquen drásticamente al calcular la posición.
*   **¿Por qué el mínimo global de error ($E_{min}(z)$) revela la profundidad real?**
    *   *Análisis:* Por el principio de mínimos cuadrados. Cuando la variable de profundidad $z$ de nuestro modelo de búsqueda coincide con la profundidad $z_0$ real de la fuente, las amplitudes teóricas se ajustan de manera óptima a las mediciones con ruido, haciendo que el residual cuadrático total caiga a su punto más bajo.

---
*Desarrollado por Carlos Julián Benavides Burbano - Ingeniería UCC Pasto.*
