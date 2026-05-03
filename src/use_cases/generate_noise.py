import numpy as np

class GenerateNoiseUseCase:
    def __init__(self, alpha: float = 0.05):
        """
        Inicializa el inyector de ruido.
        :param alpha: Nivel de ruido (por defecto 0.05, es decir 5%).
        """
        self.alpha = alpha

    def execute(self, true_amplitude: float) -> float:
        """
        Añade ruido gaussiano a la amplitud verdadera.
        Se usa una distribución normal con media 0 y desviación estándar (sigma)
        proporcional a la amplitud verdadera (alpha * true_amplitude).
        """
        sigma = self.alpha * abs(true_amplitude)
        # Ruido gaussiano eps_i
        noise = np.random.normal(loc=0.0, scale=sigma)
        return true_amplitude + noise
