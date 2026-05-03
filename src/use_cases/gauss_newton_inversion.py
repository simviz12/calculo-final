import numpy as np
from src.domain.entities import Source, Observation, Sensor, Coordinate
from src.use_cases.calculate_jacobian import CalculateJacobianUseCase
from src.use_cases.calculate_residual import CalculateResidualUseCase
from src.config import DAMPING_FACTOR, STEP_SIZE

class GaussNewtonInversionUseCase:
    def __init__(self, jacobian_uc: CalculateJacobianUseCase, residual_uc: CalculateResidualUseCase):
        self.jacobian_uc = jacobian_uc
        self.residual_uc = residual_uc

    def execute(self, observations: list[Observation], initial_guess: Source, tol: float = 1e-6, max_iter: int = 100, fixed_z: bool = False) -> tuple[Source, int, list[float]]:
        # DÍA 2 (Semana 3): Optimización Restringida
        if fixed_z:
            # Optimizamos sólo [x, y, A_0], Z permanece constante
            m = np.array([initial_guess.position.x, initial_guess.position.y, initial_guess.amplitude_0], dtype=float)
            fixed_z_val = initial_guess.position.z
        else:
            # Optimizamos las 4 variables
            m = np.array([
                initial_guess.position.x,
                initial_guess.position.y,
                initial_guess.position.z,
                initial_guess.amplitude_0
            ], dtype=float)
        
        sensors = [obs.sensor for obs in observations]
        error_history = []
        
        for iteration in range(max_iter):
            if fixed_z:
                current_source = Source(position=Coordinate(x=m[0], y=m[1], z=fixed_z_val), amplitude_0=m[2])
            else:
                current_source = Source(position=Coordinate(x=m[0], y=m[1], z=m[2]), amplitude_0=m[3])
            
            G_full = self.jacobian_uc.execute(sensors, current_source)
            
            if fixed_z:
                # Omitimos la columna 2 (derivada respecto a Z) para que G sea Mx3
                G = G_full[:, [0, 1, 3]]
            else:
                G = G_full
            
            residuals = []
            for obs in observations:
                res = self.residual_uc.execute(obs, current_source)
                residuals.append(res)
            
            delta_A_z = np.array(residuals)
            current_error = np.linalg.norm(delta_A_z)
            error_history.append(current_error)
            
            # Amortiguación configurada para calidad de software (Evita matriz singular)
            if fixed_z:
                GTG = G.T @ G + np.eye(3) * DAMPING_FACTOR
            else:
                GTG = G.T @ G + np.eye(4) * DAMPING_FACTOR
                
            GT_dA = G.T @ delta_A_z
            
            try:
                # Manejo de Excepciones (Calidad de Software)
                delta_m = np.linalg.solve(GTG, GT_dA)
            except np.linalg.LinAlgError:
                break
                
            m = m + STEP_SIZE * delta_m
            
            if np.linalg.norm(delta_m) < tol:
                break
                
        if fixed_z:
            final_source = Source(position=Coordinate(x=m[0], y=m[1], z=fixed_z_val), amplitude_0=m[2])
        else:
            final_source = Source(position=Coordinate(x=m[0], y=m[1], z=m[2]), amplitude_0=m[3])
            
        return final_source, iteration + 1, error_history
