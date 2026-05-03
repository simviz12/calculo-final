from dataclasses import dataclass

@dataclass
class Coordinate:
    x: float
    y: float
    z: float

@dataclass
class Sensor:
    id: str
    position: Coordinate

@dataclass
class Source:
    position: Coordinate
    amplitude_0: float  # A_0

@dataclass
class Observation:
    sensor: Sensor
    amplitude_observed: float

