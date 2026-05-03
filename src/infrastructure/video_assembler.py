import cv2
import os

class VideoAssembler:
    def execute(self, frames_dir: str, output_path: str, fps: int = 15):
        """
        PUNTO 4: Exportador de Cuadros para Video.
        Ensambla los frames generados en un video fluido MP4.
        """
        images = [img for img in os.listdir(frames_dir) if img.endswith(".png")]
        images.sort()
        
        if not images:
            print("No hay frames para ensamblar.")
            return
            
        first_frame = cv2.imread(os.path.join(frames_dir, images[0]))
        h, w, _ = first_frame.shape
        
        fourcc = cv2.VideoWriter_fourcc(*'mp4v') 
        video = cv2.VideoWriter(output_path, fourcc, fps, (w, h))
        
        for image in images:
            video.write(cv2.imread(os.path.join(frames_dir, image)))
            
        video.release()
        print(f"Video exportado: {os.path.abspath(output_path)}")
