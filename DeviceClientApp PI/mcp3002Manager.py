import signal
import sys
import time
import spidev
import RPi.GPIO as GPIO

# Enable SPI
spi = spidev.SpiDev(0, 0)
spi.max_speed_hz = 1200000

class MCP3002Manager:
    def get_adc(self, channel):

        # Make sure ADC channel is 0 or 1
        if channel != 0:
            channel = 1

        # Construct SPI message
        #  First bit (Start): Logic high (1)
        #  Second bit (SGL/DIFF): 1 to select single mode
        #  Third bit (ODD/SIGN): Select channel (0 or 1)
        #  Fourth bit (MSFB): 0 for LSB first
        #  Next 12 bits: 0 (don't care)
        msg = 0b11
        msg = ((msg << 1) + channel) << 5
        msg = [msg, 0b00000000]
        reply = spi.xfer2(msg)

        # Construct single integer out of the reply (2 bytes)
        adc = 0
        for n in reply:
            adc = (adc << 8) + n

        # Last bit (0) is not part of ADC value, shift to remove it
        adc = adc >> 1

        # Calculate voltage form ADC value
        # considering the soil moisture sensor is working at 5V

        return adc
