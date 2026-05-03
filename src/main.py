import sys
import os
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Importamos la configuración central
from src.config import *
from src.domain.entities import Source, Coordinate, Observation
from src.infrastructure.sensor_repository import HardcodedSensorRepository
from src.use_cases.calculate_amplitude import CalculateAmplitudeUseCase
from src.use_cases.generate_noise import GenerateNoiseUseCase
from src.use_cases.calculate_residual import CalculateResidualUseCase
from src.use_cases.calculate_jacobian import CalculateJacobianUseCase
from src.use_cases.gauss_newton_inversion import GaussNewtonInversionUseCase
from src.use_cases.calculate_error_grid import CalculateErrorGridUseCase
from src.infrastructure.plotter import Plotter
from src.infrastructure.video_assembler import VideoAssembler

def main():
    np.random.seed(42)

    print("=== 1. NÚCLEO DE SIMULACIÓN ===")
    repository = HardcodedSensorRepository()
    sensors = repository.get_all_sensors()
    
    real_source = Source(
        position=Coordinate(x=REAL_SOURCE_X, y=REAL_SOURCE_Y, z=REAL_SOURCE_Z),
        amplitude_0=REAL_SOURCE_A0
    )
    print(f"Fuente Real Oculta: ({real_source.position.x}, {real_source.position.y}, {real_source.position.z}) A0 = {real_source.amplitude_0}")
    
    calculate_amplitude = CalculateAmplitudeUseCase()
    exact_amplitudes = []
    
    for sensor in sensors:
        amp = calculate_amplitude.execute(sensor, real_source)
        exact_amplitudes.append(amp)

    print(f"Inyectando {NOISE_LEVEL*100}% de Ruido Gaussiano a los sensores...")
    generate_noise = GenerateNoiseUseCase(alpha=NOISE_LEVEL)
    observations = []
    
    for sensor, exact_amp in zip(sensors, exact_amplitudes):
        noisy_amp = generate_noise.execute(exact_amp)
        obs = Observation(sensor=sensor, amplitude_observed=noisy_amp)
        observations.append(obs)
        
    calculate_residual = CalculateResidualUseCase(calculate_amplitude_uc=calculate_amplitude)
    calculate_jacobian = CalculateJacobianUseCase()

    print("\n=== 2. MOTOR DE CÁLCULO Y OPTIMIZACIÓN (Gauss-Newton) ===")
    inversion_uc = GaussNewtonInversionUseCase(calculate_jacobian, calculate_residual)
    
    initial_guesses = [
        Source(position=Coordinate(x=4.0, y=6.0, z=-4.0), amplitude_0=90.0),
        Source(position=Coordinate(x=0.0, y=0.0, z=-1.0), amplitude_0=50.0),
        Source(position=Coordinate(x=10.0, y=10.0, z=-10.0), amplitude_0=200.0)
    ]
    
    best_convergence_history = []
    
    for i, guess in enumerate(initial_guesses):
        final_source, iterations, error_hist = inversion_uc.execute(observations, guess, tol=TOLERANCE, max_iter=MAX_ITERATIONS)
        if i == 0:
            best_convergence_history = error_hist
            
        print(f"Prueba {i+1}: Terminó en {iterations} iteraciones -> Estimado: ({final_source.position.x:.4f}, {final_source.position.y:.4f}, {final_source.position.z:.4f})")

    print("\n=== 3. MÓDULO DE ANÁLISIS DE PROFUNDIDAD ===")
    z_values = np.linspace(Z_SCAN_END, Z_SCAN_START, 11)
    best_errors_by_z = []
    
    print("Iniciando Escáner de Planos Horizontales...")
    for z_test in z_values:
        guess_z = Source(position=Coordinate(x=5.0, y=5.0, z=z_test), amplitude_0=90.0)
        final_src, iters, errors = inversion_uc.execute(observations, guess_z, tol=TOLERANCE, max_iter=MAX_ITERATIONS, fixed_z=True)
        final_error = errors[-1] if errors else float('inf')
        best_errors_by_z.append((z_test, final_error, final_src))
        print(f"  Z={z_test:+.1f} -> Error: {final_error:.6f}")

    best_z_info = min(best_errors_by_z, key=lambda item: item[1])
    print(f"-> [Buscador del Mínimo Global] El menor error pertenece al plano Z = {best_z_info[0]:.1f}")

    print("\n=== 4. VISUALIZACIÓN Y DIAGNÓSTICO ===")
    plotter = Plotter()
    
    plot_conv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "convergencia_plot.png")
    plotter.plot_convergence(best_convergence_history, output_path=plot_conv_path)
    
    z_list = [item[0] for item in best_errors_by_z]
    e_min_list = [item[1]**2 for item in best_errors_by_z]
    plot_z_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "error_vs_z_plot.png")
    plotter.plot_error_vs_z(z_list, e_min_list, output_path=plot_z_path)

    print(f"\n--- 5. EXPORTADOR MASIVO (Opcional) ---")
    print(f"Generando {Z_SCAN_STEPS} Heatmaps para Video...")
    error_grid_uc = CalculateErrorGridUseCase(calculate_amplitude)
    
    # Normalización para que el color sea consistente
    grids_test = [error_grid_uc.execute(observations, REAL_SOURCE_Z, REAL_SOURCE_A0, X_RANGE, Y_RANGE, grid_size=GRID_RESOLUTION)[2]]
    vmax_norm = np.percentile(grids_test[0], 80)

    frames_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frames")
    os.makedirs(frames_dir, exist_ok=True)
    
    z_frames = np.linspace(Z_SCAN_START, Z_SCAN_END, Z_SCAN_STEPS)
    for idx, z_f in enumerate(z_frames):
        X_f, Y_f, E_f = error_grid_uc.execute(observations, z_f, REAL_SOURCE_A0, X_RANGE, Y_RANGE, grid_size=GRID_RESOLUTION)
        plotter.plot_heatmap(X_f, Y_f, E_f, z_f, vmin=0, vmax=vmax_norm, output_path=os.path.join(frames_dir, f"frame_{idx:03d}.png"))
        if (idx+1)%20 == 0: print(f"  Progreso: {idx+1}/{Z_SCAN_STEPS}")

    video_assembler = VideoAssembler()
    video_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "escaneo_profundidad.mp4")
    video_assembler.execute(frames_dir, video_path, fps=15)

    print("\n--- 📊 INFORME TÉCNICO DE PRECISIÓN (CIERRE) ---")
    final_est = best_z_info[2]
    print(f"Ubicación Real:    ({REAL_SOURCE_X}, {REAL_SOURCE_Y}, {REAL_SOURCE_Z}) km")
    print(f"Ubicación Estimada: ({final_est.position.x:.2f}, {final_est.position.y:.2f}, {best_z_info[0]:.2f}) km")
    
    error_x = abs(REAL_SOURCE_X - final_est.position.x)
    error_y = abs(REAL_SOURCE_Y - final_est.position.y)
    error_z = abs(REAL_SOURCE_Z - best_z_info[0])
    
    print(f"Desviación Absoluta: ΔX={error_x:.3f}km, ΔY={error_y:.3f}km, ΔZ={error_z:.3f}km")
    print(f"El software ha localizado el sismo con una precisión del {100 - (error_x+error_y+error_z):.2f}% bajo condiciones de ruido del {NOISE_LEVEL*100}%.")

    print("\n¡Simulación Matemática Full (Todododo) Completada!")

if __name__ == "__main__":
    main()
