import numpy as np
import math
from src.domain.entities import Sensor, Source

class CalculateJacobianUseCase:
    def execute(self, sensors: list[Sensor], hypothetical_source: Source) -> np.ndarray:
        """
        Calcula la matriz Jacobiana G de tamaño M x 4 (M = número de sensores).
        Cada fila corresponde a un sensor i.
        Las columnas corresponden a las derivadas parciales de la amplitud
        respecto a los parámetros de la fuente hipotética:
        Col 0: dA/dx
        Col 1: dA/dy
        Col 2: dA/dz
        Col 3: dA/dA_0
        
        DÍA 1: Derivadas Parciales (Teoría)
        A = A_0 * e^-R / R
        R = sqrt((x - xi)^2 + (y - yi)^2 + (z - zi)^2)
        
        Derivadas:
        1. dA/dA_0 = e^-R / R
        2. dA/dx = dA/dR * dR/dx
           - dA/dR = -A_0 * e^-R * (R + 1) / R^2
           - dR/dx = (x - xi) / R
           - Por lo tanto: dA/dx = -A_0 * e^-R * (R + 1) / R^3 * (x - xi)
        Lo mismo aplica simétricamente para 'y' y 'z'.
        """
        M = len(sensors)
        G = np.zeros((M, 4))
        
        x = hypothetical_source.position.x
        y = hypothetical_source.position.y
        z = hypothetical_source.position.z
        A_0 = hypothetical_source.amplitude_0
        
        for i, sensor in enumerate(sensors):
            xi = sensor.position.x
            yi = sensor.position.y
            zi = sensor.position.z
            
            dx = x - xi
            dy = y - yi
            dz = z - zi
            R = math.sqrt(dx**2 + dy**2 + dz**2)
            
            if R == 0:
                # Caso extremo donde el origen colisiona exactamente con un sensor
                G[i, :] = [0, 0, 0, 0]
                continue
                
            # Factor común para las derivadas espaciales (-A_0 * e^-R * (R+1) / R^3)
            common_factor = -A_0 * math.exp(-R) * (R + 1) / (R**3)
            
            dA_dx = common_factor * dx
            dA_dy = common_factor * dy
            dA_dz = common_factor * dz
            
            dA_dA0 = math.exp(-R) / R
            
            G[i, 0] = dA_dx
            G[i, 1] = dA_dy
            G[i, 2] = dA_dz
            G[i, 3] = dA_dA0
            
        return G
