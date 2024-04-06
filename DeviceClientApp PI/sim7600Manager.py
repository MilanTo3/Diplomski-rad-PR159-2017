import time
import serial

class Sim7600Manager:
    
    ID = ""
    mqtt_server = ""
    username = ""
    password = ""
    pub = ""
    sub = ""
    ser = serial.Serial('/dev/ttyS0', baudrate=115200, timeout=1) # check this!
    subThreadStart = None

    def __init__(self, client_id, server, user, password, pubi, subi, subThread):
        
        self.ID = client_id
        self.mqtt_server = server
        self.username = user
        self.password = password
        self.pub = pubi
        self.sub = subi
        self.subThreadStart = subThread

    def setup(self):
        isSerial2Available = True
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
        dataLength = str(len(self.pub))
        connect_cmd = "AT+CMQTTTOPIC=0,{}".format(dataLength) # Publish to the inputed topic.
        self.input_message(connect_cmd, self.pub)

        time.sleep(1.5)

        # Deo za subscribe.
        
        dataLength = str(len('channels/2429193/subscribe'))
        connect_cmd = "AT+CMQTTSUBTOPIC=0,{},0".format(dataLength) # Subscribe to the inputed topic.
        self.input_message(connect_cmd, "channels/2429193/subscribe")
        time.sleep(0.5)
        self.SentMessage('AT+CMQTTSUB=0\r\n')

    def SentMessage(self, p_char):
        global isSerial2Available # CAREFUL!!!
        towrite = p_char.encode()
        self.ser.write(towrite)
        time.sleep(1)

        response = self.ser.read_all().decode()
        print(response)
        responses = response.split('\r\n')
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
        global startSent
        self.ser.write(p_char.encode() + b'\r\n')
        time.sleep(0.2)
        encodedstr = p_data.encode() + b'\r\n'
        self.ser.write(p_data.encode() + b'\r\n')
        time.sleep(1)

        response = self.ser.read_all().decode()
        responses = response.split('\r\n')
        for resp in responses:
            if "+CMQTTSUB: 0," in resp:
                status = int(resp.split("+CMQTTSUB: 0,")[1])
                if status == 0:
                    print("\nSubTopic Sub")
                    startSent = True
                    self.subThreadStart()

    def publishData(self, updateMsn):
        
        dataLength = str(len(self.pub))
        connect_cmd = "AT+CMQTTTOPIC=0,{}".format(dataLength) # Publish to the inputed topic.
        self.input_message(connect_cmd, self.pub)

        dataLength = str(len(str(updateMsn)))        
        connect_cmd = "AT+CMQTTPAYLOAD=0,{}".format(dataLength) # Input the publish message
        self.input_message(connect_cmd, str(updateMsn))

        time.sleep(0.5)
        self.ser.write(b'AT+CMQTTPUB=0,0,120\r\n') # Publish the inputed message.
