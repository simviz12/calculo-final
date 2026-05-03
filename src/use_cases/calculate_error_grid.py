import numpy as np
from src.domain.entities import Source, Observation, Coordinate
from src.use_cases.calculate_amplitude import CalculateAmplitudeUseCase

class CalculateErrorGridUseCase:
    def __init__(self, calculate_amplitude_uc: CalculateAmplitudeUseCase):
        self.calculate_amplitude_uc = calculate_amplitude_uc

    def execute(self, observations: list[Observation], z: float, A_0: float, x_range: tuple, y_range: tuple, grid_size: int = 50) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        PUNTO 4: Generador de Mapas de Calor (Heatmaps).
        Evalúa el error en una malla meshgrid para un plano Z específico.
        """
        x_vals = np.linspace(x_range[0], x_range[1], grid_size)
        y_vals = np.linspace(y_range[0], y_range[1], grid_size)
        
        X, Y = np.meshgrid(x_vals, y_vals)
        E = np.zeros_like(X)
        
        for i in range(grid_size):
            for j in range(grid_size):
                test_x = X[i, j]
                test_y = Y[i, j]
                hypothetical_source = Source(position=Coordinate(x=test_x, y=test_y, z=z), amplitude_0=A_0)
                
                error_sum = 0.0
                for obs in observations:
                    calc_amp = self.calculate_amplitude_uc.execute(obs.sensor, hypothetical_source)
                    res = obs.amplitude_observed - calc_amp
                    error_sum += res**2
                E[i, j] = error_sum
                
        return X, Y, E
