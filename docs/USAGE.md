# Usage Guide

## Presets Inventory

The module automatically generates presets to help you get started quickly.

### Category: Utility

* **Scan Project**: **(Essential)** Scans the current Ableton project to update track/scene counts, names, and colors.

### Category: Clip - Fire

A grid of buttons that allows you to:

* **Fire a clip** (Press).
* **Display the clip name** as the button name.
* **Display the clip color** as the button background.
* **Blink** when the clip is playing.

### Category: Clip - Stop

A grid of buttons to stop specific clips:

* **Stop Clip**: Stops the clip on a specific track/scene.
  * **Red Background**.
  * Displays "STOP" and the clip name.

### Category: Clip - Fade

Presets to fade clips in or out:

* **Fade In Clip**: Fires a clip with a smooth volume fade-in (default 1.5s).
* **Fade Out Clip**: Fades out a clip's volume and stops it (default 3.5s).

### Category: Track - Meter & Mute

Buttons to control tracks:

* **Mute Track**: Toggles track mute.
  * Displays track name.
  * **Red Background** when muted.
  * **Visual Meter** (Right bar) showing real-time audio level.

### Category: Track - Stop

* **Stop Track**: Stops playing all clips on a specific track. Displays the track name.

### Category: Track - Meter

Buttons displaying real-time track audio levels:

* **Meter Track**: Displays the track name and a dynamic bargraph.

### Category: Track - Fade

Presets to fade tracks in or out:

* **Fade In Track**: Fades in the track volume (default 1.5s).
* **Fade Out Track**: Fades out the track volume (default 3.5s).
  * **Behavior**: Fades volume to 0, stops all playing clips on the track, then restores the volume to its initial level.

### Category: Device - Toggle

* **Device Toggle**: Toggles a device (On/Off) on a specific track.
  * Displays device name.
  * **Green Background** when the device is On.

### Category: Device - Select and Control

A set of generic buttons to control the *currently selected* parameter (see Actions).

* **Step Up (+)** / **Step Down (-)**: Increases or decreases the value of the selected parameter.
* **Set ON** / **Set OFF**: Sets the selected parameter to max (100%) or min (0%).
* **Toggle**: Toggles the selected parameter between 0 and 1.
* **Selected Parameter Value**: Displays the current value of the selected parameter.
* **Select Parameter**: A generic button to select a parameter (requires configuration).

### Category: Device Parameters (Dynamic)

* **Select Parameter [Name]**: Automatically generated buttons for every parameter found during "Scan Project". Pressing one selects that parameter for control via the "Device - Select and Control" buttons.

## Features & Feedbacks

### Actions

* **Fire Clip**: Triggers a clip (Track, Scene).
* **Stop Clip**: Stops the current clip on a track.
* **Stop Track**: Stops all clips on a track.
* **Mute Track**: Toggles, Mutes, or Unmutes a track.
* **Fade Out and Stop Clip**: Fades out volume and stops the clip.
* **Fade In and Fire Clip**: Fades in volume and fires the clip.
* **Fade Out and Stop Track**: Fades out track volume, stops clips, and restores volume.
* **Fade In Track Volume**: Fades in track volume.
* **Fade Track by State**: Advanced fading based on a variable state (See [Advanced Fading Guide](FADE_BY_STATE.md)).
* **Refresh Clip Info**: Forces an update of names and colors for a specific clip.
* **Scan Project**: Updates the entire module state from Ableton.
* **Device Actions**:
  * **Device Toggle**: Toggles a device on/off.
  * **Set Parameter Value**: Sets a specific value for a parameter.
  * **Step Parameter**: Increments/Decrements a parameter value.
  * **Select Device Parameter**: Selects a parameter for the "Select and Control" presets.

#### Note: "Create Variable for this parameter?"

When using actions like **Set Parameter Value** or **Step Parameter**, you will see a checkbox labeled **"Create Variable for this parameter?"**.

* **Checked**: The module will create a dynamic variable for this parameter (e.g., `$(ableton:device_param_1_1_1)`). This allows you to display the real-time value of this parameter on a button.
* **Unchecked**: The parameter is controlled blindly without feedback/variable update. This saves resources and is recommended if you don't need to see the value.

### Feedbacks

* **Clip Color**: Changes button background to match Ableton clip color.
* **Clip Playing (Blink)**: Blinks the button when the clip is playing.
* **Track Meter Level**: Changes color if audio level exceeds a threshold.
* **Track Mute**: Changes background color (Red) if track is muted.
* **Track Meter Visual**: Displays a real-time PNG bargraph on the button (Stereo Left, Stereo Right, or Full).

## Variables

* `$(ableton:clip_name_TRACK_CLIP)`: Clip name (e.g., `$(ableton:clip_name_1_1)`).
* `$(ableton:track_name_TRACK)`: Track name.
* `$(ableton:track_meter_TRACK)`: Current track audio level (0.0 to 1.0).
* `$(ableton:track_mute_TRACK)`: Track mute state (1 or 0).

## Troubleshooting

* **No visual feedback (Meters/Names)?**
  * Did you run **Scan Project**?
  * Check that the "Receive Port" in Companion matches the output port configured in AbletonOSC (usually 11001).
  * Check that no firewall is blocking UDP ports 11000 and 11001.
* **Module disconnects/reconnects?**
  * Check Companion logs. If it persists, check your network configuration.
