from src.domain.entities import Source, Observation
from src.use_cases.calculate_amplitude import CalculateAmplitudeUseCase

class CalculateResidualUseCase:
    def __init__(self, calculate_amplitude_uc: CalculateAmplitudeUseCase):
        self.calculate_amplitude_uc = calculate_amplitude_uc

    def execute(self, observation: Observation, hypothetical_source: Source) -> float:
        """
        Calcula el residuo para un sensor dado, que es la diferencia entre 
        la amplitud medida empíricamente (observada con ruido) y la amplitud predicha 
        por el modelo matemático usando parámetros hipotéticos (x_h, y_h, z_h, A_0h).
        
        Residuo r_i = A_obs_i - A_calc_i
        """
        # Calcular la amplitud predicha usando la fuente hipotética
        calculated_amplitude = self.calculate_amplitude_uc.execute(
            sensor=observation.sensor, 
            source=hypothetical_source
        )
        
        # Función de residuo
        residual = observation.amplitude_observed - calculated_amplitude
        return residual
