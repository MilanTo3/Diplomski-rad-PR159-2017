from picamera2 import Picamera2, Preview
from pathlib import Path

class CameraController:

    camera = Picamera2()

    def __init__(self) -> None:
        config = self.camera.create_still_configuration(main={"size": (800, 600)})
        self.camera.configure(config)

    def takePicture(self):
        self.camera.start()
        self.camera.capture_file(self.getCurrentDirectory())
        self.camera.stop()

    def getCurrentDirectory(self):
        path = Path(__file__).absolute().parent
        path = path / 'capture.jpg'
        return path