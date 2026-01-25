

HomeModuleshub.button
hub.button

pressed(buttonCode)
Returns the amount of time (in ms) a button on the SPIKE hub has been pressed

PARAMETER	TYPE	DESCRIPTION
buttonCode	Integer (0-3)	Button code corresponding to a button on the SPIKE Hub
Returns: Amount of time a button on the SPIKE hub has been pressed (in ms)
from hub import button
left_button_press_duration = 0
right_button_press_duration = 0
while not button.pressed(button.LEFT) and not button.pressed(button.RIGHT):
    pass
while button.pressed(button.LEFT) or button.pressed(button.RIGHT):
    left_button_press_duration = button.pressed(button.LEFT)
    right_button_press_duration = button.pressed(button.RIGHT)
if left_button_press_duration > 0:
    print("The left button was pressed for " + str(left_button_press_duration) + " milliseconds")
if right_button_press_duration > 0:
    print("The right button was pressed for " + str(right_button_press_duration) + " milliseconds")


---



HomeModulescolor
color

rgb(port)
Returns the RGB value of the color detected by the color sensor.

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub.
Returns: An RGB value, see constants for matching codes
from hub import port
          import color, color_sensor
print(color.rgb(color_sensor.color(port.A)))

---



HomeModulescolor_matrix
color_matrix

get_pixel(arg1, agr2, arg3)
Get some pixel information. Use display.display_get_pixel instead.

PARAMETER	TYPE	DESCRIPTION
arg1	Integer	?
agr2	Integer	?
arg3	Integer	?
Returns: (Integer, Integer)
import color_matrix
color_matrix.get_pixel(1, 2, 2)
set_pixel(port, x, y, lego color, brightness)
Set a color on a specific pixel with a given brightness.

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub. Use portmodule.
x	Integer (0-2)	The horizontal position of the pixel to light up
y	Integer (0-2)	The vertical position of the pixel to light up
lego color	Integer	What color to show in the LED. See Color sensor for colors.
brightness	Integer (0-10)	How bright should the LED light up
Returns: Nothing
from hub import port
import color
import color_matrix
               
# Change the color of the 0,0 pixel on the Color Matrix connected to
port A
color_matrix.set_pixel(port.A, 0, 0, color.RED, 10)
# Print the color of the 0,0 pixel on the Color Matrix connected to
port A
print(color_matrix.get_pixel(port.A, 0, 0))
show(port, light_array_for_all_pixels)
Set all pixels on a color matrix at once.

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub. Use portmodule.
light_array_for_all_pixels	Integer List	A byte list with information about how to light up each pixel.
Returns: Nothing
import color_matrix, port
# Light up all pixels in RED with max brightness
brightness = 10
color = LEGO_RED
# generate a list with same setting for each of the 9 pixels.
led_info_list = [(brightness << 4) + color] * 9
# make sure to convert to list to bytes
color_matrix.show(port.A, bytes(led_info_list))


---



HomeModulescolor_sensor
color_sensor

can_detect(port, color)
Detects if a color can be detected at a specified port

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub.
color	Integer	A color from the color module
Returns: Boolean
import color_sensor, color
from hub import port
print(color_sensor.can_detect(port.C, color.BLUE))
color(port)
Returns the color detected by the color sensor

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub.
Returns: An integer color code from the color module
import color_sensor, color
            
from hub import port
if color_sensor.color(port.C) is color.RED:
    print("Red detected")
elif color_sensor.color(port.C) is color.MAGENTA:
    print("Magenta deteced")
reflection(port)
An integer (between 1 and 100) representing the amount of light reflected

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub.
Returns: An integer between 1 and 100
import color_sensor, port
color_sensor.reflection(port.C)
raw_rgbi(port)
Gets the RGBI value detected by the color sensor

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub.
Returns: A tuple value with the RGBI value (Red, Green, Blue, Intensity).
import color_sensor
from hub import port
color_sensor.raw_rgbi(port.C)


---



HomeModulesdevice
device

data(port)
Retrieve the raw LPF-2 data from a device

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub.
Returns: An integer list of LPF-2 data (tuple of integers)
import device
from hub import port
print(device.data(port.A))
device_id(port)
Retrieve the device ID from a port

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub.
Returns: An integer device ID
import device
from hub import port
print(device.device_id(port.A))
is_ready(port)
When a device is attached to the hub it might take a short amount of time before it's ready to accept requests. Use is_ready to test for the readiness of the attached devices if you've replaced main.py on the hub with your own program

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub.
Returns: A boolean if the device is ready to use
import device
from hub import port
print(device.is_ready(port.A))
wait_ready(port, timeout)
When a device is attached to the hub it might take a short amount of time before it's ready to accept requests. Use is_ready to test for the readiness of the attached devices if you've replaced main.py on the hub with your own program

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub.
timeout	Integer	Number of milliseconds to wait for the port to be ready. Will trigger a DeviceTimeout if no device is ready in the specified timeframe.
Returns: A boolean if the device is ready to use
import device, runloop
from hub import port
async def main():
  await device.wait_ready(port.A)
  print("Port A ready!")
runloop.run(main())

---



HomeModulesdistance_sensor
distance_sensor

distance(port)
Gets the distance (mm) from the sensor to an object

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub.
Returns: Distance measurements in millimeters (mm)
import distance_sensor
from hub import port
distance_sensor.distance(port.D)
get_pixel(port, row, column)
Returns the brightness value of a specific light on the distance sensor

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub.
row	Integer	pixel row
column	Integer	pixel column
Returns: Brightness of pixel/light on sensor (0-100)
import distance_sensor
from hub import port
distance_sensor.set_pixel(port.D, 0, 0, 75)
distance_sensor.get_pixel(port.D, 0, 0)
set_pixel(port, row, column, brightness)
Sets the brightness of a distance sensor pixel

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub.
row	Integer	pixel row
column	Integer	pixel column
brightness	Integer (0-100)	pixel brightness
Returns: Nothing
import distance_sensor
from hub import port
distance_sensor.set_pixel(port.D, 0, 0, 75)
show(port, bytes([TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT]))
Sets the brightness of multiple distance sensor pixels at once

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub.
bytes([TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT])	Byte Object	Byte array with distance sensor brightness values
Returns: Nothing
import distance_sensor
from hub import port
# Turn all all lights on distance sensor. 100 = full brightness
distance_sensor.show(port.D, bytes([100,100,100,100]))
clear(port)
Turns off all lights on the distance sensor

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub.
Returns: Nothing
import distance_sensor
from hub import port
distance_sensor.clear(port.D)

---



HomeModulesforce_sensor
force_sensor

force(port)
Gets the current force sensor value

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub.
Returns: Force value in deci-newtons (dN). 0.1N = 1dN
import force_sensor
from hub import port
force_sensor.force(port.E)
pressed(port)
Checks if the force sensor is currently pressed

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub.
Returns: Boolean, True if pressed, False if not pressed
import force_sensor
from hub import port
force_sensor.pressed(port.E)
raw(port)
Gets the raw sensor data

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub.
Returns: Integer value sensed by the force sensor
import force_sensor
from hub import port
force_sensor.raw(port.E)

---



HomeModuleshub
hub

battery_voltage()
Returns voltage of battery (mV)

Returns: Integer
import hub
# Get battery voltage (mV)  
hub.battery_voltage()
battery_temperature()
Returns battery temperature (in Kelvin)

Returns: Integer
import hub
# Get battery temperature (K)  
hub.battery_temperature()
battery_current()
Returns battery current (mA)

Returns: Integer
import hub
# Get battery current (mA)  
hub.battery_current()
usb_charge_current()
Returns USB charge current (mA)

Returns: Integer
import hub
# Get USB charge current (mA)  
hub.usb_charge_current()
power_off()
Turns the hub off (disconnects from REPL)

Returns: Nothing
import hub
 
hub.power_off()
hardware_id()
Returns hardware ID

Returns: String
import hub
  
hub.hardware_id()
device_uuid(port)
Returns device UUID of a sensor/motor

PARAMETER	TYPE	DESCRIPTION
port	Integer	Port constant
Returns: String
import hub
# Get device UUID 
hub.device_uuid(hub.port.A)

---



HomeModuleshub.light_matrix
hub.light_matrix

display_clear()
Turn off all pixels on the 5x5 matrix display

Returns: Nothing
from hub import light_matrix
# Clears hub display 
light_matrix.clear()
set_pixel(column, row, brightness)
Turns on pixel on 5x5 matrix display to desired brightness

PARAMETER	TYPE	DESCRIPTION
column	Integer (0-4)	Pixel column (x-value)
row	Integer (0-4)	Pixel row (y-value)
brightness	Integer (0-100)	Pixel brightness (percentage out of 100)
Returns: Nothing
from hub import light_matrix
# Turns on pixel in column 1, row 1, to 100% brightness
light_matrix.set_pixel(1, 1, 100)
# Turn on the pixel in the center of the hub 
light_matrix.set_pixel(2, 2, 100)
write(text, brightness, time_per_char)
Write and display a text string on the 5x5 matrix display for a duration with a brightness

PARAMETER	TYPE	DESCRIPTION
text	String	Text to be displayed
brightness	Integer (0-100)	Brightness of text (percentage out of 100)
time_per_char	Integer (milliseconds)	Time spent on each character
Returns: Nothing
from hub import light_matrix
# Write "Hi There" on the 5x5 display.
# Make the animation take 2 seconds.
# Set the brightness of each letter to 100
light_matrix.write("Hi There", 100, 750)
get_pixel(column, row)
Checks brightness percentage level of a pixel on 5x5 matrix display

PARAMETER	TYPE	DESCRIPTION
column	Integer (0-4)	Pixel column (x-value)
row	Integer (0-4)	Pixel row (y-value)
Returns: Integer (0-100)
from hub import light_matrix
# Turns on pixel in column 1, row 1, to 73% brightness
light_matrix.set_pixel(1,1,73)
# Checks brightness percentage level of pixel in column 1, row, 1
# Should return 73
light_matrix.get_pixel(1,1)
invert()
Inverts all hub pixels, turns all active pixels off and turns all off pixels on.

Returns: Nothing
from hub import light_matrix
# Update pixels to invert an image on Light Matrix using the invert function 
# Show a small heart 
light_matrix.show_image(2)
# Invert the image, so the heart is unlit and the background is lit 
light_matrix.invert()
show_image(pictogram_key, intensity)
Shows an predefined LEGO created image based on IDs

PARAMETER	TYPE	DESCRIPTION
pictogram_key	Integer (0-66)	Image ID, see docs in code sample
intensity	Integer (0-100)	
Returns: Nothing
from hub import light_matrix
import time
# What numbers map to each pictorgram? Read the docs below!
# https://docs.google.com/document/d/1m2BSe43-q8vxN7as5mN_ojofSZisrvGawrcCIzOj-eI/
# Shows a heart
light_matrix.show_image(1)
time.sleep(2)
# Shows a smile face
light_matrix.show_image(3)
set_orientation(angle)
Rotates the hub display to a specific degree value (must be a multiple of 90)

PARAMETER	TYPE	DESCRIPTION
angle	Integer (0, 90, 180, or 270)	Angle to rotate an image on the hub
Returns: Nothing
from hub import light_matrix
light_matrix.set_orientation(90)
get_orientation()
Gets the orientation of the light matrix image/pixels

Returns: Nothing
from hub import light_matrix
light_matrix.get_orientation()
show_image(image)
Shows an image?

PARAMETER	TYPE	DESCRIPTION
image	Object	Object with buffer protocol
Returns: Nothing
from hub import light_matrix
display.display_show_image("Some Image")

---



HomeModulesmotor
motor

stop(port)
Stops a running motor. Stops all motors if no port is specified?

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub, indicates which motor to stop
Returns: Nothing
import motor, time
from hub import port
# Start motor 
motor.run(port.A, 1000)
# Wait for 2 seconds 
time.sleep_ms(2000)
# Stop motor 
motor.stop(port.A)
absolute_position(port)
Get absolute position in degrees

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub, indicates which motor to stop
Returns: Integer: Position of motor in degrees
import motor
from hub import port
motor.absolute_position(port.A)
relative_position(port)
Gets the relative position of a motor

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub, indicates which motor to stop
Returns: Integer: Position of motor in degrees
import motor
from hub import port
motor.relative_position(port.A)
reset_relative_position(port, position)
Resets the relative position of a motor

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub, indicates which motor to stop
position	Integer	Optional parameter to set relative position to
Returns: Nothing
import motor
from hub import port
motor.reset_relative_position(port.A, 0)
run(port, power)
Starts a motor at a given power level

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub. Use port module.
power	Integer	Motor Power
Returns: Nothing
import motor, time
from hub import port
# Starts motor at power=1000 and runs for 1 second
motor.run(port.A, 1000)
time.sleep_ms(1000)
motor.stop(port.A)
run_for_time(port, time, speed)
Runs a given motor for a specified number of milliseconds

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub.
time	Integer	Milliseconds to run the motor for
speed	Integer	Motor speed
Returns: Nothing
from hub import port
import runloop
import motor
async def main():
    # Run for 1 second
    await motor.run_for_time(port.A, 1000, 280)
    # Run for 10 seconds with a slow deceleration
    await motor.run_for_time(port.A, 10000, 280, deceleration=10)
runloop.run(main())
run_for_degrees(port, degrees, speed)
Moves a motor a specified number of degrees. Positive degree values are clockwise, negative are counter clockwise.

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub. Use port module.
degrees	Integer	Number of degrees to move the motor
speed	Integer	Speed of the motor
Returns: Nothing
import motor
from hub import port
motor.run_for_degrees(port.A, 360, 5000)
motor.run_for_degrees(port.B, 360, 5000)
velocity(port)
Retrieves the velocity/speed of the motor

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub.
Returns: Velocity in m/s
import motor
from port import motor
motor.velocity(port.A)
motor_get_status(port)
PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing port on hub.
Returns: An Integer status code
MOTOR_READY -- 0
MOTOR_RUNNING -- 1
MOTOR_STALLED -- 2
MOTOR_ABORTED -- 3
MOTOR_REGULATION_ERROR -- 4
MOTOR_DISCONNECTED -- 5
import motor, port
motor.motor_get_status(port.PORTA)
motor_get_high_resolution_mode(port)
Returns True if the port is in high resolution mode, False otherwise.

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing a port of the hub
Returns: A Boolean
import motor
from hub import port
motor.motor_get_high_resolution_mode(port.A)
motor_set_high_resolution_mode(port, state)
Can switch a motor in and out of high resolution mode (purpose of this mode is uncertain)

PARAMETER	TYPE	DESCRIPTION
port	Integer	Integer representing a port of the hub
state	boolean	True to set motor in high resolution mode, False to disable
Returns: Nothing
import motor
from hub import port
motor.motor_set_high_resolution_mode(port.A, True)


---



HomeModuleshub.motion_sensor
hub.motion_sensor

acceleration()
Returns the X, Y, and Z acceleration values of the hub.

Returns: Acceleration values as a integer tuple of length 3
from hub import motion_sensor
motion_sensor.acceleration()
angular_velocity(raw_unfiltered)
Returns the X, Y, and Z angular velocity values of the hub as a integer.

PARAMETER	TYPE	DESCRIPTION
raw_unfiltered	boolean	Optional parameter to toggle unfiltered output.
Returns: Angular velocity values as a integer tuple of length 3
from hub import motion_sensor
motion_sensor.angular_velocity()
gesture()
Gets the most recent gesture that the hub has experienced, see constants for gesture types.

Returns: Integer gesture type
from hub import motion_sensor
motion_sensor.gesture()
is_stable()
Returns if the hub is on a flat surface and is stationary.

Returns: Boolean value
from hub import motion_sensor
motion_sensor.is_stable()
get_yaw_face()
Get the current yaw face

Returns: Integer hub face
from hub import motion_sensor
motion_sensor.get_yaw_face()
reset_yaw_angle(offset)
Reset the current yaw angle with an offset

PARAMETER	TYPE	DESCRIPTION
offset	Integer	degrees offset to calibrate the yaw angle
Returns: Nothing
from hub import motion_sensor
motion_sensor.reset_yaw_angle(0)
set_yaw_face()
Sets yaw face to specified hub face

Returns: Nothing
from hub import motion_sensor
motion_sensor.acceleration()
set_tap_sensitivity(threshold, configuration)
Sets yaw face to specified hub face

PARAMETER	TYPE	DESCRIPTION
threshold	Integer	Sensitivity level to count as a tap
configuration	Integer	Configuration mode
Returns: Boolean
from hub import motion_sensor
motion_sensor.acceleration()
tap_count()
Gets the current number of times the hub has experienced a tap action.

Returns: Integer count value
from hub import motion_sensor
motion_sensor.tap_count()
reset_tap_count()
Resets the current tap count (see tap_count())

Returns: Boolean
from hub import motion_sensor
motion_sensor.reset_tap_count()
reset_tilt_angles()
Resets tilt angle measurements

Returns: Nothing
from hub import motion_sensor
motion_sensor.reset_tilt_angles()
up_face()
Returns the hub face that is currently up, see constants for hub faces

Returns: An integer representing a hub face
from hub import motion_sensor
motion_sensor.up_face()


---



HomeModulesmotor_pair
motor_pair

pair(motor_pair_id, leftMotorPort, rightMotorPort)
Creates a new motor_pair instance in a motor_pair id slot

PARAMETER	TYPE	DESCRIPTION
motor_pair_id	Integer (0-2)	PAIR_1 -- 0, PAIR_2 -- 1, PAIR_3 -- 2
leftMotorPort	Integer	Integer representing port on hub.
rightMotorPort	Integer	Integer representing port on hub.
Returns: Nothing
import motor_pair
from hub import port
motor_pair.pair(motor_pair.PAIR1, port.PORTA, port.PORTB)
unpair(motor_pair_id)
Frees motor_pair slot, deletes initialized motor_pair instance

PARAMETER	TYPE	DESCRIPTION
motor_pair_id	Integer (0-2)	PAIR_1 -- 0, PAIR_2 -- 1, PAIR_3 -- 2
Returns: Nothing
import motor_pair
from hub import port
motor_pair.unpair(motor_pair.PAIR_1)
move(motor_pair_id, steering, velocity, acceleration)
Moves the motor pair in a specified direction

PARAMETER	TYPE	DESCRIPTION
motor_pair_id	Integer (0-2)	PAIR_1 -- 0, PAIR_2 -- 1, PAIR_3 -- 2
steering	Integer(-100 to 100)	Steering value/direction
velocity	Integer	Optional: velocity of motors
acceleration	Integer	Optional: acceleration of motors
Returns: Nothing
import motor_pair, time
from hub import port
#unpair just in case
motor_pair.unpair(motor_pair.PAIR_1)
motor_pair.pair(motor_pair.PAIR_1, port.A, port.B)
motor_pair.move(motor_pair.PAIR_1, 3000)
# Uncomment to stop motors
# time.sleep(1)
# motor_pair.stop(motor_pair.PAIR_1)
move_for_degrees(motor_pair_id, steering_factor, degrees, acceleration)
Moves motor_pair a specified number of degrees with a steeing factor

PARAMETER	TYPE	DESCRIPTION
motor_pair_id	Integer (0-2)	PAIR_1 -- 0, PAIR_2 -- 1, PAIR_3 -- 2
steering_factor	Integer(-100 to 100)	Direction to steer motor_pair
degrees	Integer	Number of degrees to turn motors
acceleration	Integer	Unknown
Returns: Nothing
 from hub import port
import runloop, motor_pair
async def main():
    # Unpair just in case 
    motor_pair.unpair(motor_pair.PAIR_1)
    # Pair motors on port A and B 
    motor_pair.pair(motor_pair.PAIR_1, port.A, port.B)
    # Move straight at default velocity for 90 degrees 
    await motor_pair.move_for_degrees(motor_pair.PAIR_1, 90, 0)
    # Move straight at a specific velocity for  second 
    await motor_pair.move_for_degreesNO(motor_pair.PAIR_1, 1000, 0, velocity=280)
    # Move straight at a specific velocity for 10 seconds with a slow deceleration 
    await motor_pair.move_for_degrees(motor_pair.PAIR_1, 10000, 0, velocity=280, deceleration=10)
runloop.run(main())
move_for_time(motor_pair_id, steering_factor, time, velocity, acceleration)
Moves the motor_pair motors for a specified number of milliseconds

PARAMETER	TYPE	DESCRIPTION
motor_pair_id	Integer (0-2)	PAIR_1 -- 0, PAIR_2 -- 1, PAIR_3 -- 2
steering_factor	Integer(-100 to 100)	Direction to steer motor_pair
time	Integer	Time (in ms) to run motors
velocity	Integer	Optional: Velocity
acceleration	Integer	Optional: Acceleration
Returns: Nothing
import motor_pair
from hub import port
motor_pair.pair(motor_pair.PAIR_1, port.A, port.B)
# Moves motor_pair for 1 second
motor_pair.move_for_time(motor_pair.PAIR_1, 0, 1000, 1000)
tank_move(motor_pair_id, leftMotorSpeed, rightMotorSpeed)
Runs the motor_pair motors until stopped.

PARAMETER	TYPE	DESCRIPTION
motor_pair_id	Integer (0-2)	PAIR_1 -- 0, PAIR_2 -- 1, PAIR_3 -- 2
leftMotorSpeed	Integer	Speed of Motor 1
rightMotorSpeed	Integer	Speed of Motor 2
Returns: Nothing
import motor_pair, time
from hub import port
motor_pair.pair(motor_pair.PAIR_1, port.A, port.B)                
# Runs motor_pair forever
motor_pair.tank_move(motor_pair.PAIR_1, 10000, 10000)
# Uncomment to stop motor
'''
time.sleep(1)
motor_pair._stop(motor_pair.PAIR_1)
'''
tank_move_for_degrees(motor_pair_id, leftMotorSpeed, rightMotorSpeed, degrees)
Turns motors a specified number of degrees. Deceleration and acceleration are optional parameters.

PARAMETER	TYPE	DESCRIPTION
motor_pair_id	Integer (0-2)	PAIR_1 -- 0, PAIR_2 -- 1, PAIR_3 -- 2
leftMotorSpeed	Integer	Speed of Motor 1
rightMotorSpeed	Integer	Speed of Motor 2
degrees	Integer	Degrees to turn motors
Returns: Nothing
import motor_pair
from hub import port
motor_pair.pair(motor_pair.PAIR_1, port.PORTA, port.PORTB)
                
motor_pair.tank_move_for_degrees(motor_pair.PAIR_1, 10000, 10000, 360)
tank_move_for_time(motor_pair_id, leftMotorSpeed, rightMotorSpeed, time_ms)
Runs the motor_pair for a specified amount of time. Deceleration and acceleration are optional parameters.

PARAMETER	TYPE	DESCRIPTION
motor_pair_id	Integer (0-2)	PAIR_1 -- 0, PAIR_2 -- 1, PAIR_3 -- 2
leftMotorSpeed	Integer	Speed the Left Motor
rightMotorSpeed	Integer	Speed of the Right Motor
time_ms	Integer	Time (in ms) to run motors
Returns: Nothing
import motor_pair
from hub import port
motor_pair.pair(motor_pair.PAIR_1, port.PORTA, port.PORTB)
                
# Run motor_pair for 3 seconds
motor_pair.tank_move_for_time(motor_pair.PAIR_1, 10000, 10000, 3000)
stop(motor_pair_id)
Stops a motor_pair

PARAMETER	TYPE	DESCRIPTION
motor_pair_id	Integer (0-2)	PAIR_1 -- 0, PAIR_2 -- 1, PAIR_3 -- 2
Returns: Nothing
import motor_pair
motor_pair.stop(PAIR_1)


---



HomeModulesrunloop
runloop

run(listIterator)
Runs functions using parallelism

PARAMETER	TYPE	DESCRIPTION
listIterator	Iterator	An iterator
Returns: Nothing
from hub import light_matrix
import runloop
async def main():
    light_matrix.write("Hi!")
    # Wait for five seconds 
    await runloop.sleep_ms(5000)
    light_matrix.write("Are you still here?")
runloop.run(main())


---



HomeModulesuos
uos

sync()
Syncs all file systems

Returns: Nothing
import uos
uos.sync()
uname()
Returns information about the SPIKE Hub

Returns: String tuple length 5: (sysname, nodename, release, version, machine)
import uos
uos.uname()
chdir(dir)
Changes the current directory

PARAMETER	TYPE	DESCRIPTION
dir	String	A directory path
Returns: Nothing
import uos
uos.mkdir("NewDir")
uos.chdir("NewDir")
getcwd()
Gets the full path of the current working directory

Returns: A String file path
import uos
uos.getcwd()
listdir()
Lists all files and folders in the current working directory

Returns: List of String file and folder names
import uos
uos.uname()
mkdir(newDir)
Creates a new folder in the current working directory

PARAMETER	TYPE	DESCRIPTION
newDir	String	A string to title the new folder
Returns: Nothing
import uos
uos.mkdir("directory")
remove(fileName)
Deletes a file/folder in the file system

PARAMETER	TYPE	DESCRIPTION
fileName	String	File/folder path to be deleted
Returns: Nothing
import uos
uos.mkdir("directory")
uos.delete("directory")
rename(oldName, newName)
Renames a file/folder

PARAMETER	TYPE	DESCRIPTION
oldName	String	File path of file/folder to be renamed
newName	String	New name of the specified folder/file
Returns: Nothing)
import uos
uos.mkdir("directory")
uos.rename("directory", "newDirectory")
rmdir(dir)
Deletes a directory/folder

PARAMETER	TYPE	DESCRIPTION
dir	String	Directory path to be deleted
Returns: Nothing
import uos
# Creates a deletes a directory
uos.mkdir("directory")
uos.rmdir("directory")
stat()
Returns information about a file/folder

Returns: Integer tuple length 10: first entry is file/folder size
import uos
uos.stat("main.py")
statvfs()
Returns information about a mounted file system

Returns: Integer tuple length 10
f_bsize - file system block size
f_frsize - fragment size
f_blocks - size of fs in f_frsize units
f_bfree - number of free blocks
f_bavail - number of free blocks for unpriviliged users
f_files - number of inodes
f_ffree - number of free inodes
f_favail - number of free inodes for unpriviliged users
f_flag - mount flags
f_namemax - maximum filename length
import uos
uos.statvfs("main.py")
mount(fsobj, mount_point)
Nounts a file to the MicroPython file system.

PARAMETER	TYPE	DESCRIPTION
fsobj	VFS Object	File system object, can be created using VfsLfs2 class
mount_point	String	File system directory path
Returns: Nothing
# Example Coming Soon!
# Use VfsLfs2!
umount(file)
Unmounts a file from the filesystem

PARAMETER	TYPE	DESCRIPTION
file	String	File path of a file to unmount
Returns: Nothing
# Example Coming Soon!


---



HomeModuleshub.sound
hub.sound

beep(beepFrequency, time, volume)
Plays a beep sound off of the SPIKE Hub

PARAMETER	TYPE	DESCRIPTION
beepFrequency	Integer	Frequency of the beep sound
time	Integer	Length of beep (in ms)
volume	Integer	Volume of beep (0-100)
Returns: Nothing
from hub import sound
sound.beep(1000, 1000, 25)
stop()
Stops playing any hub sounds/beeps

Returns: Nothing
# Stops a beep early
from hub import sound 
import time
sound.beep(700, 5000, 25)
            
time.sleep(1)
            
sound.stop()
volume(volume)
Set the volume to a new level

PARAMETER	TYPE	DESCRIPTION
volume	Integer (0-100)	New volume level to set the speaker to
Returns: Nothing
# Changes the volume of a beep
from hub import sound 
import time
sound.beep(500, 2500, 50)
            
time.sleep(1)
            
sound.volume(100)
