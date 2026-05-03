import math
from src.domain.entities import Sensor, Source

class CalculateAmplitudeUseCase:
    def execute(self, sensor: Sensor, source: Source) -> float:
        """
        Aplica el modelo directo: A_zi = A_0 * (e^-R / R)
        """
        # Calcular la distancia R
        dx = sensor.position.x - source.position.x
        dy = sensor.position.y - source.position.y
        dz = sensor.position.z - source.position.z
        
        R = math.sqrt(dx**2 + dy**2 + dz**2)
        
        if R == 0:
            return source.amplitude_0  # Evitar división por cero
            
        # Fórmula: A_zi = A_0 * (e^-R / R)
        amplitude = source.amplitude_0 * (math.exp(-R) / R)
        return amplitude
