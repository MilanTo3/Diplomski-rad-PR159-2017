import time
import serial, json

class Sim7600Manager:
    
    ID = ""
    mqtt_server = ""
    username = ""
    password = ""
    pub = ""
    sub = ""
    ser = serial.Serial('/dev/ttyS0', baudrate=115200, timeout=1) # check this!
    subThreadStart = None
    uploadImage = 'https://api.imgur.com/3/image'
    imgurKey = ''

    def __init__(self, client_id, server, user, password, pubi, subi, key, subThread):
        
        self.ID = client_id
        self.mqtt_server = server
        self.username = user
        self.password = password
        self.pub = pubi
        self.sub = subi
        self.subThreadStart = subThread
        self.imgurKey = key

    def setup(self):
        self.SentMessage('AT+CMQTTDISC=0,60\r\n')
        time.sleep(0.5) 
        self.SentMessage('AT+CMQTTREL=0\r\n')
        time.sleep(0.5) 
        self.SentMessage('AT+CMQTTSTART\r\n') # Enable MQTT service.
        time.sleep(1)
        connect_cmd = 'AT+CMQTTACCQ=0,"'+ self.ID +'",0,4' # Apply for MQTT client with client ID.
        self.SentMessage(connect_cmd + '\r\n')
        time.sleep(1)
        connect_cmd = 'AT+CMQTTCONNECT=0,"tcp://mqtt3.thingspeak.com",60,1,"'+ self.username +'","'+ self.password +'"'  # Send MQTT connection request to the server.
        self.SentMessage(connect_cmd + '\r\n')
        time.sleep(2)

        # Deo za subscribe.
        
        dataLength = str(len(self.sub))
        connect_cmd = "AT+CMQTTSUB=0,{},0".format(dataLength) # Subscribe to the inputed topic.
        self.input_message(connect_cmd, self.sub)

    def SentMessage(self, p_char):
        global isSerial2Available # CAREFUL!!!
        towrite = p_char.encode()
        self.ser.write(towrite)
        time.sleep(1)

        response = self.ser.read_all().decode()
        responses = response.split('\r\n')
        print(response)
        for resp in responses:
            if "+CREG: 0," in resp:
                status = int(resp.split("+CREG: 0,")[1]) # Check if connected to the network.
                if status == 6:
                    isSerial2Available = False
                    print("\nNetWork Connected")
            elif "+CMQTTCONNECT: 0," in resp:
                status = int(resp.split("+CMQTTCONNECT: 0,")[1]) # Check if the client is connected.
                if status == 0:
                    isSerial2Available = False
                    print("\nMqtt Connected")
            elif resp == "+CMQTTSTART: 23":
                isSerial2Available = False
                print("\nMqtt is already Connected")
                    
    def input_message(self, p_char, p_data):

        self.ser.write(p_char.encode() + b'\r\n')
        time.sleep(0.2)
        self.ser.write(p_data.encode() + b'\r\n')
        time.sleep(1)

        response = self.ser.read_all().decode()
        responses = response.split('\r\n')
        print(response)
        for resp in responses:
            if "+CMQTTSUB: 0," in resp:
                status = int(resp.split("+CMQTTSUB: 0,")[1])
                if status == 0:
                    self.subThreadStart(self.ser)

    def publishData(self, updateMsn):
        dataLength = str(len(self.pub))
        connect_cmd = "AT+CMQTTTOPIC=0,{}".format(dataLength) # Publish to the inputed topic.
        self.input_message(connect_cmd, self.pub)

        dataLength = str(len(str(updateMsn)))        
        connect_cmd = "AT+CMQTTPAYLOAD=0,{}".format(dataLength) # Input the publish message
        self.input_message(connect_cmd, str(updateMsn))
        
        time.sleep(0.5)
        self.ser.write(b'AT+CMQTTPUB=0,0,120\r\n') # Publish the inputed message.

    def httpPostImageToImgur(self, image64):
        self.SentMessage('AT+HTTPTERM\r\n')
        time.sleep(0.5)
        self.SentMessage('AT+HTTPINIT\r\n')
        time.sleep(0.5)
        self.SentMessage('AT+HTTPPARA="URL","{}"\r\n'.format(self.uploadImage))
        time.sleep(0.5)
        self.SentMessage('AT+HTTPPARA="USERDATA","Authorization: Client-ID {}"\r\n'.format(self.imgurKey))
        time.sleep(0.5)
        self.SentMessage('AT+HTTPPARA="CONTENT","application/json"\r\n')
        time.sleep(0.5)
        k = {"image": image64.decode()}
        f = json.dumps(k)
        self.input_message('AT+HTTPDATA={},400'.format(len(f)), f)
        time.sleep(1)
        self.SentMessage('AT+HTTPACTION=1\r\n')
        time.sleep(1)
        self.SentMessage('AT+HTTPREAD=500\r\n')
        time.sleep(0.5)
        self.SentMessage('AT+HTTPTERM\r\n')
