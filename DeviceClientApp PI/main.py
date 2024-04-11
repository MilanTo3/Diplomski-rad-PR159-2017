import time
import threading
from configparser import ConfigParser
from pathlib import Path
import RPi.GPIO as GPIO
from camController import CameraController
from imageManager import ImageManager
from PIL import Image
import adafruit_dht
import gpiozero
from sensorManager import SensorManager
from sim7600Manager import Sim7600Manager

# ----- Podaci za MQTT autentikaciju i komunikaciju:

path = Path(__file__).absolute().parent
configlocation = path / 'config.txt'
conf = ConfigParser()
conf.readfp(open(configlocation))

ID = conf.get('My Section', 'ID') # Client id
username = conf.get('My Section', 'username')
password = conf.get('My Section', 'password')
channelID = conf.get('My Section', 'channelID')
imgurKey = conf.get('My Section', 'imgurClientID')

mqtt_server = "mqtt3.thingspeak.com"

pub = "channels/"+ channelID +"/publish" # field1=100&field2=50
sub = "channels/"+ channelID +"/subscribe/fields/field6" # subscribe to image request field

def thread_Start(ser):
  thread = threading.Thread(target=getResponseData, args=(ser, gsmLock))
  thread.daemon = True
  thread.start()

gsmLock = threading.Lock()
sensorManager = SensorManager()
sim7600 = Sim7600Manager(ID, mqtt_server, username, password, pub, sub, imgurKey, thread_Start)
# ------------------
imageManager = ImageManager()
camController = CameraController()

def buttonCallback(self):
  print('callback: ' + str(GPIO.input(17)))

GPIO.setmode(GPIO.BCM)
#GPIO.setup(17, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
#GPIO.add_event_detect(17, GPIO.RISING, buttonCallback)

Record = { "vlaznost_vazduha": 0,
           "temperatura": 0,
           "kvalitet_vazduha": 0,
           "vlaznost_zemljista": 0,
           "uv_zracenje": 0 }

def loop():

  sim7600.setup()
  while True:
    getRecords()
    writeRecords()
    sendRecords()

    time.sleep(60)

def getRecords():

  Record["kvalitet_vazduha"] = sensorManager.readAirQuality()
  Record["vlaznost_zemljista"] = sensorManager.readSoilMoisturePercentage()
  th = sensorManager.readTempandHumidity()
  Record["temperatura"] = th[0]
  Record["vlaznost_vazduha"] = th[1]
  Record["uv_zracenje"] = sensorManager.readUVIndex()

def writeRecords():

  print("\n Temperatura: " + str(Record["temperatura"]) + "\t Vlaznost vazduha: " + str(Record["vlaznost_vazduha"])
        + "\t Vlaznost zemljista: " + str(Record["vlaznost_zemljista"]) + "\t Kvalitet vazduha: " + str(Record["kvalitet_vazduha"])
        + "\t UV zracenje: " + str(Record["uv_zracenje"]))

def sendRecords():
  gsmLock.acquire()
  sim7600.publishData("field1=" + str(Record["temperatura"]) + "&field2=" + str(Record["vlaznost_vazduha"]) + "&field3=" + str(Record["vlaznost_zemljista"]) 
                      + "&field4=" + str(Record["kvalitet_vazduha"]) + "&field5=" + str(Record["uv_zracenje"]))
  gsmLock.release()

def getResponseData(ser, lock):
  
  while True:
    while ser.in_waiting:
      lock.acquire()
      c:str = ser.read_all().decode()
      lock.release()
      if "CMQTTRXPAYLOAD" in c:
        k = c.split('\r\n')
        filter = [x for x in k if x.startswith('+CMQTTRXPAYLOAD')]
        if filter.count != 0:
          payloadIndex = k.index(filter[0]) + 1
          payload = k[payloadIndex]
          print('Payload is: '+ payload)
          if(payload == 'IR'): # if theres a image request:
            camController.takePicture()
            imageManager.JPEGSaveWithTargetSize(Image.open(path / 'capture.jpg'), 'compressedcapture.jpg', 80000)
            base64image = imageManager.convertToBase64()
            lock.acquire()
            sim7600.httpPostImageToImgur(base64image)
            lock.release()
    time.sleep(1)

def sendSnapshot(base64image):
  sim7600.httpPostImageToImgur(base64image)

loop()