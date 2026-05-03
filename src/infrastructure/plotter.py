import matplotlib.pyplot as plt
import os

class Plotter:
    def plot_amplitudes(self, sensors, exact_amplitudes, observed_amplitudes, output_path="amplitudes_plot.png"):
        """
        Genera una gráfica comparando las amplitudes exactas y las observadas con ruido.
        Esto permite visualizar el reto que tendrá el algoritmo de inversión.
        """
        sensor_ids = [sensor.id for sensor in sensors]
        
        x = range(len(sensor_ids))
        
        plt.figure(figsize=(10, 6))
        
        # Línea de amplitudes exactas
        plt.plot(x, exact_amplitudes, marker='o', linestyle='-', color='blue', label='Amplitud Exacta (Sin ruido)', markersize=8)
        
        # Línea de amplitudes observadas (ruidosas)
        plt.plot(x, observed_amplitudes, marker='x', linestyle='--', color='red', label='Amplitud Observada (Con ruido)', markersize=8)
        
        plt.title('DÍA 5: Prueba de Hipótesis - Amplitudes Exactas vs Observadas')
        plt.xlabel('Sensores')
        plt.ylabel('Amplitud (A_zi)')
        plt.xticks(x, sensor_ids)
        plt.legend()
        plt.grid(True, linestyle=':', alpha=0.7)
        
        plt.tight_layout()
        plt.savefig(output_path)
        print(f"La gráfica ha sido generada y guardada en: {os.path.abspath(output_path)}")
        
        # Cerrar la figura para liberar memoria
        plt.close()

    def plot_convergence(self, error_history, output_path="convergencia_plot.png"):
        """
        DÍA 4: Gráfica de convergencia (Error vs Iteración).
        Muestra cómo baja el error total a medida que el algoritmo itera.
        """
        plt.figure(figsize=(8, 5))
        plt.plot(range(1, len(error_history) + 1), error_history, marker='o', linestyle='-', color='purple')
        plt.title('DÍA 4: Convergencia de Gauss-Newton')
        plt.xlabel('Iteración')
        plt.ylabel('Error Total (Norma del Residuo)')
        plt.grid(True, linestyle=':', alpha=0.7)
        plt.tight_layout()
        plt.savefig(output_path)
        print(f"Gráfica de convergencia guardada en: {os.path.abspath(output_path)}")
        plt.close()

    def plot_error_vs_z(self, z_values, error_values, output_path="error_vs_z_plot.png"):
        """
        DÍA 5: Gráfica de E_min vs Z.
        Muestra el valle donde el error se minimiza, indicando la profundidad.
        """
        plt.figure(figsize=(8, 5))
        plt.plot(z_values, error_values, marker='s', linestyle='-', color='green', linewidth=2)
        
        # Resaltar el punto mínimo (el "valle")
        min_idx = error_values.index(min(error_values))
        plt.plot(z_values[min_idx], error_values[min_idx], marker='*', color='red', markersize=15, label=f'Mínimo en Z={z_values[min_idx]:.1f}')
        
        plt.title('DÍA 5: Error Cuadrático Mínimo vs Profundidad (Z)')
        plt.xlabel('Profundidad Z (km)')
        plt.ylabel('Error E_min(z)')
        plt.legend()
        plt.grid(True, linestyle=':', alpha=0.7)
        plt.tight_layout()
        plt.savefig(output_path)
        print(f"Gráfica de Error vs Z guardada en: {os.path.abspath(output_path)}")
        plt.close()

    def plot_heatmap(self, X, Y, E, z_val, vmin, vmax, output_path="heatmap.png"):
        """Generador de Heatmaps 2D."""
        plt.figure(figsize=(6, 5))
        cp = plt.pcolormesh(X, Y, E, shading='auto', cmap='viridis', vmin=vmin, vmax=vmax)
        plt.colorbar(cp, label='Error')
        plt.title(f'Mapa de Calor Z = {z_val:.1f}')
        plt.xlabel('X (km)'); plt.ylabel('Y (km)')
        plt.tight_layout()
        plt.savefig(output_path, dpi=80)
        plt.close()
