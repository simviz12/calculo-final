from src.config import SENSORS

class HardcodedSensorRepository:
    def get_all_sensors(self) -> list:
        return SENSORS
