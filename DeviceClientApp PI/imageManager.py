import io
import math
import sys
import numpy as np
from PIL import Image
import requests
import base64
from pathlib import Path
from configparser import ConfigParser

class ImageManager:
   
   path = Path(__file__).absolute().parent
   configlocation = path / 'config.txt'
   conf = ConfigParser()
   conf.readfp(open(configlocation))

   ID = conf.get('My Section', 'imgurClientID')
   
   url = "https://api.imgur.com/3/image"
   headers = {"Authorization": "Client-ID " + ID}
   
   def JPEGSaveWithTargetSize(self, im, filename, target):
      """Save the image as JPEG with the given name at best quality that makes less than "target" bytes"""
      # Min and Max quality
      Qmin, Qmax = 25, 90
      # Highest acceptable quality found
      Qacc = -1
      while Qmin <= Qmax:
         m = math.floor((Qmin + Qmax) / 2)

         # Encode into memory and get size
         buffer = io.BytesIO()
         im.save(buffer, format="JPEG", quality=m)
         s = buffer.getbuffer().nbytes

         if s <= target:
            Qacc = m
            Qmin = m + 1
         elif s > target:
            Qmax = m - 1

      if Qacc > -1:
         im.save(self.path / filename, format="JPEG", quality=Qacc)
      else:
         print("ERROR: No acceptable quality factor found", file=sys.stderr)
         
   def uploadImage(self):

      base64_data = self.convertToBase64()
      length = len(base64_data)
      print(length)
      response = requests.post(self.url, headers=self.headers, data={"image": base64_data})
      uploadurl = response.json()["data"]["link"]
      print(uploadurl)
      
      return uploadurl
      
   def convertToBase64(self):
      with open(self.path / "compressedcapture.jpg", "rb") as file:
         data = file.read()
         base64_data = base64.b64encode(data)
      return base64_data