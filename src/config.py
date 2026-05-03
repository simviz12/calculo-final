from src.domain.entities import Coordinate, Sensor

# ==============================================================
# 5. CALIDAD DE SOFTWARE: PARÁMETROS DE CONFIGURACIÓN
# Archivo centralizado para interactuar con el código sin romperlo
# ==============================================================

# -- PARÁMETROS DEL ALGORITMO DE INVERSIÓN (Gauss-Newton) --
INITIAL_GUESS_X = 0.0
INITIAL_GUESS_Y = 0.0
INITIAL_GUESS_Z = 0.0
INITIAL_GUESS_A0 = 100.0  # Suposición inicial alejada para prueba de estrés

# Nivel de Ruido Gaussiano (0.10 = 10% de error inyectado)
NOISE_LEVEL = 0.10  

# -- CONFIGURACIÓN DE LOS SENSORES (Escenario 1) --
SENSORS = [
    Sensor(id="S1", position=Coordinate(x=0.0, y=0.0, z=0.0)),
    Sensor(id="S2", position=Coordinate(x=5.0, y=0.0, z=0.0)),
    Sensor(id="S3", position=Coordinate(x=0.0, y=5.0, z=0.0)),
    Sensor(id="S4", position=Coordinate(x=5.0, y=5.0, z=0.0)),
    Sensor(id="S5", position=Coordinate(x=2.5, y=2.5, z=-1.5)), # Sensor en pozo
]

# -- PARÁMETROS DE LA FUENTE REAL (La "Verdad" oculta) --
REAL_SOURCE_X = 2.2
REAL_SOURCE_Y = 2.8
REAL_SOURCE_Z = -3.0
REAL_SOURCE_A0 = 150.0

# -- MOTOR DE CÁLCULO Y OPTIMIZACIÓN (GAUSS-NEWTON) --
TOLERANCE = 1e-6          # Criterio de Convergencia Inteligente
MAX_ITERATIONS = 100      # Límite para evitar ciclos infinitos
DAMPING_FACTOR = 1e-4     # Regularización de Levenberg-Marquardt (Estabilidad)
STEP_SIZE = 0.5           # Tamaño del paso iterativo

# -- MÓDULO DE ANÁLISIS DE PROFUNDIDAD Y VISUALIZACIÓN --
Z_SCAN_START = 0.0        # Superficie
Z_SCAN_END = -10.0        # Profundidad máxima a escanear
Z_SCAN_STEPS = 50         # Número de cuadros para el video (reducido para velocidad)
GRID_RESOLUTION = 30      # Resolución del Heatmap
X_RANGE = (-2.0, 12.0)
Y_RANGE = (-2.0, 12.0)
