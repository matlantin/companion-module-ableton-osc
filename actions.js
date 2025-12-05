module.exports = function (self) {
	self.setActionDefinitions({
		fire_clip: {
			name: 'Fire Clip',
			options: [
				{
					type: 'number',
					label: 'Track Index',
					id: 'track',
					min: 1,
					max: 1000,
					default: 1,
					required: true
				},
				{
					type: 'number',
					label: 'Clip Index',
					id: 'clip',
					min: 1,
					max: 1000,
					default: 1,
					required: true
				}
			],
			callback: async (event) => {
				const track = event.options.track - 1
				const clip = event.options.clip - 1
				self.sendOsc('/live/clip_slot/fire', [
					{
						type: 'i',
						value: track
					},
					{
						type: 'i',
						value: clip
					}
				])
			}
		},
		stop_clip: {
			name: 'Stop Clip',
			options: [
				{
					type: 'number',
					label: 'Track Index',
					id: 'track',
					min: 1,
					max: 1000,
					default: 1,
					required: true
				},
				{
					type: 'number',
					label: 'Clip Index',
					id: 'clip',
					min: 1,
					max: 1000,
					default: 1,
					required: true
				}
			],
			callback: async (event) => {
				const track = event.options.track - 1
				const clip = event.options.clip - 1
				self.sendOsc('/live/clip/stop', [
					{
						type: 'i',
						value: track
					},
					{
						type: 'i',
						value: clip
					}
				])
			}
		},
		stop_track: {
			name: 'Stop Track',
			options: [
				{
					type: 'number',
					label: 'Track Index',
					id: 'track',
					min: 1,
					max: 1000,
					default: 1,
					required: true
				}
			],
			callback: async (event) => {
				const track = event.options.track - 1
				self.sendOsc('/live/track/stop_all_clips', [
					{
						type: 'i',
						value: track
					}
				])
			}
		},
		mute_track: {
			name: 'Mute Track',
			options: [
				{
					type: 'number',
					label: 'Track Index',
					id: 'track',
					min: 1,
					max: 1000,
					default: 1,
					required: true
				},
				{
					type: 'dropdown',
					label: 'Mute State',
					id: 'mute',
					default: 'toggle',
					choices: [
						{ id: 'toggle', label: 'Toggle' },
						{ id: 'on', label: 'Mute' },
						{ id: 'off', label: 'Unmute' }
					]
				}
			],
			callback: async (event) => {
				const track = event.options.track - 1
				let mute = event.options.mute
				
				if (mute === 'toggle') {
					// Invert current state
					// trackMutes is 1-based
					const current = self.trackMutes[event.options.track]
					mute = current ? 'off' : 'on'
				}
				
				const val = mute === 'on' ? 1 : 0
				
				self.sendOsc('/live/track/set/mute', [
					{
						type: 'i',
						value: track
					},
					{
						type: 'i',
						value: val
					}
				])
			}
		},
		device_toggle: {
			name: 'Device (Plugin) Toggle',
			options: [
				{
					type: 'number',
					label: 'Track Index',
					id: 'track',
					min: 1,
					max: 1000,
					default: 1,
					required: true
				},
				{
					type: 'number',
					label: 'Device Index',
					id: 'device',
					min: 1,
					max: 100,
					default: 1,
					required: true
				},
				{
					type: 'number',
					label: 'Parameter Index (Default 1 = On/Off)',
					id: 'parameter',
					min: 1,
					max: 1000,
					default: 1,
					required: true
				},
				{
					type: 'dropdown',
					label: 'State',
					id: 'state',
					default: 'toggle',
					choices: [
						{ id: 'toggle', label: 'Toggle' },
						{ id: 'on', label: 'On' },
						{ id: 'off', label: 'Off' }
					]
				}
			],
			callback: async (event) => {
				const track = event.options.track - 1
				const device = event.options.device - 1
				const parameter = event.options.parameter - 1
				let state = event.options.state
				
				// Ensure we are listening to this parameter (Fix for "Toggle works only once")
				// We send this every time to be safe, it's cheap.
				self.sendOsc('/live/device/start_listen/parameter/value', [
					{ type: 'i', value: track },
					{ type: 'i', value: device },
					{ type: 'i', value: parameter }
				])

				if (state === 'toggle') {
					const current = self.deviceParameters[`${event.options.track}_${event.options.device}_${event.options.parameter}`]
					// If current is undefined, assume it's on (1) so we turn it off, or vice versa. 
					// Safer to assume 0 if unknown? Or maybe we can't toggle if unknown.
					// Let's assume 0 if undefined.
					const currentVal = current !== undefined ? current : 0
					state = currentVal > 0.5 ? 'off' : 'on'
				}
				
				const val = state === 'on' ? 1.0 : 0.0
				
				self.sendOsc('/live/device/set/parameter/value', [
					{ type: 'i', value: track },
					{ type: 'i', value: device },
					{ type: 'i', value: parameter },
					{ type: 'f', value: val }
				])
			}
		},
		fade_stop_clip: {
			name: 'Fade Out and Stop Clip',
			options: [
				{
					type: 'number',
					label: 'Track Index',
					id: 'track',
					min: 1,
					max: 1000,
					default: 1,
					required: true
				},
				{
					type: 'number',
					label: 'Clip Index',
					id: 'clip',
					min: 1,
					max: 1000,
					default: 1,
					required: true
				},
				{
					type: 'number',
					label: 'Duration (ms)',
					id: 'duration',
					min: 100,
					max: 60000,
					default: 3500,
					required: true
				}
			],
			callback: async (event) => {
				const track = event.options.track - 1
				const clip = event.options.clip - 1
				const duration = event.options.duration

				const id = `clip_${track}_${clip}`
				
				if (!self.activeFades) self.activeFades = {}

				// Check for existing fade to interrupt
				const existingFade = self.activeFades[id]
				let targetVolume = undefined

				if (existingFade) {
					if (existingFade.interval) {
						clearInterval(existingFade.interval)
					}
					targetVolume = existingFade.startValue
				}
				
				self.activeFades[id] = {
					type: 'clip',
					direction: 'out',
					track,
					clip,
					duration,
					startTime: Date.now(),
					state: 'init',
					targetVolume: targetVolume
				}

				// Request current gain to start the process
				self.sendOsc('/live/clip/get/gain', [
					{ type: 'i', value: track },
					{ type: 'i', value: clip }
				])
			}
		},
		fade_fire_clip: {
			name: 'Fade In and Fire Clip',
			options: [
				{
					type: 'number',
					label: 'Track Index',
					id: 'track',
					min: 1,
					max: 1000,
					default: 1,
					required: true
				},
				{
					type: 'number',
					label: 'Clip Index',
					id: 'clip',
					min: 1,
					max: 1000,
					default: 1,
					required: true
				},
				{
					type: 'number',
					label: 'Duration (ms)',
					id: 'duration',
					min: 100,
					max: 60000,
					default: 3500,
					required: true
				}
			],
			callback: async (event) => {
				const track = event.options.track - 1
				const clip = event.options.clip - 1
				const duration = event.options.duration

				const id = `clip_${track}_${clip}`
				
				if (!self.activeFades) self.activeFades = {}

				// Check for existing fade to interrupt
				const existingFade = self.activeFades[id]
				let targetVolume = undefined

				if (existingFade) {
					if (existingFade.interval) {
						clearInterval(existingFade.interval)
					}
					targetVolume = existingFade.startValue
				}
				
				self.activeFades[id] = {
					type: 'clip',
					direction: 'in',
					track,
					clip,
					duration,
					startTime: Date.now(),
					state: 'init',
					targetVolume: targetVolume
				}

				self.sendOsc('/live/clip/get/gain', [
					{ type: 'i', value: track },
					{ type: 'i', value: clip }
				])
			}
		},
		fade_stop_track: {
			name: 'Fade Out and Stop Track',
			options: [
				{
					type: 'number',
					label: 'Track Index',
					id: 'track',
					min: 1,
					max: 1000,
					default: 1,
					required: true
				},
				{
					type: 'number',
					label: 'Duration (ms)',
					id: 'duration',
					min: 100,
					max: 60000,
					default: 3500,
					required: true
				}
			],
			callback: async (event) => {
				const track = event.options.track - 1
				const duration = event.options.duration

				const id = `track_${track}`
				
				if (!self.activeFades) self.activeFades = {}

				// Check for existing fade to interrupt
				const existingFade = self.activeFades[id]
				let targetVolume = undefined

				if (existingFade) {
					if (existingFade.interval) {
						clearInterval(existingFade.interval)
					}
					targetVolume = existingFade.startValue
				}
				
				self.activeFades[id] = {
					type: 'track',
					direction: 'out',
					track,
					duration,
					startTime: Date.now(),
					state: 'init',
					targetVolume: targetVolume
				}

				self.sendOsc('/live/track/get/volume', [
					{ type: 'i', value: track }
				])
			}
		},
		fade_in_track: {
			name: 'Fade In Track Volume',
			options: [
				{
					type: 'number',
					label: 'Track Index',
					id: 'track',
					min: 1,
					max: 1000,
					default: 1,
					required: true
				},
				{
					type: 'number',
					label: 'Duration (ms)',
					id: 'duration',
					min: 100,
					max: 60000,
					default: 3500,
					required: true
				}
			],
			callback: async (event) => {
				const track = event.options.track - 1
				const duration = event.options.duration

				const id = `track_${track}`
				
				if (!self.activeFades) self.activeFades = {}

				// Check for existing fade to interrupt
				const existingFade = self.activeFades[id]
				let targetVolume = undefined

				if (existingFade) {
					if (existingFade.interval) {
						clearInterval(existingFade.interval)
					}
					targetVolume = existingFade.startValue
				}
				
				self.activeFades[id] = {
					type: 'track',
					direction: 'in',
					track,
					duration,
					startTime: Date.now(),
					state: 'init',
					targetVolume: targetVolume
				}

				self.sendOsc('/live/track/get/volume', [
					{ type: 'i', value: track }
				])
			}
		},
		fade_track_toggle: {
			name: 'Fade Track by State (Variable)',
			options: [
				{
					type: 'textinput',
					label: 'State (True/False)',
					id: 'state',
					default: 'false',
					useVariables: true
				},
				{
					type: 'number',
					label: 'Track Index',
					id: 'track',
					min: 1,
					max: 1000,
					default: 1,
					required: true
				},
				{
					type: 'number',
					label: 'Hold time (ms)',
					id: 'hold_time',
					min: 0,
					max: 60000,
					default: 0,
					required: true
				},
				{
					type: 'number',
					label: 'Rise time (ms)',
					id: 'rise_time',
					min: 100,
					max: 60000,
					default: 750,
					required: true
				},
				{
					type: 'number',
					label: 'On time (ms)',
					id: 'on_time',
					min: 0,
					max: 60000,
					default: 500,
					required: true
				},
				{
					type: 'number',
					label: 'Fall time (ms)',
					id: 'fall_time',
					min: 100,
					max: 60000,
					default: 3500,
					required: true
				}
			],
			callback: async (event) => {
				const track = event.options.track - 1
				
				// Parse state
				let state = await self.parseVariablesInString(event.options.state)
				if (typeof state === 'string') {
					state = state.toLowerCase().trim()
				}
				
				const isTrue = (state === 'true' || state === '1' || state === 'on')
				
				const riseTime = event.options.rise_time
				const fallTime = event.options.fall_time
				const onTime = event.options.on_time
				const holdTime = event.options.hold_time

				const id = `track_${track}`
				
				// Clear any pending delay (whether it was for In or Out)
				if (self.trackDelays && self.trackDelays[id]) {
					clearTimeout(self.trackDelays[id])
					delete self.trackDelays[id]
				}

				if (isTrue) {
					// FADE IN (Delayed by Hold Time)
					if (!self.trackDelays) self.trackDelays = {}

					if (holdTime > 0) {
						self.trackDelays[id] = setTimeout(() => {
							self.setupTrackToggleFade(track, 'in', riseTime)
							delete self.trackDelays[id]
						}, holdTime)
					} else {
						self.setupTrackToggleFade(track, 'in', riseTime)
					}
				} else {
					// FADE OUT (Delayed by On Time)
					if (!self.trackDelays) self.trackDelays = {}
					
					if (onTime > 0) {
						self.trackDelays[id] = setTimeout(() => {
							self.setupTrackToggleFade(track, 'out', fallTime)
							delete self.trackDelays[id]
						}, onTime)
					} else {
						self.setupTrackToggleFade(track, 'out', fallTime)
					}
				}
			}
		},
		refresh_clip_info: {
			name: 'Refresh Clip Info',
			options: [
				{
					type: 'number',
					label: 'Track Index',
					id: 'track',
					min: 1,
					max: 1000,
					default: 1,
					required: true
				},
				{
					type: 'number',
					label: 'Clip Index',
					id: 'clip',
					min: 1,
					max: 1000,
					default: 1,
					required: true
				}
			],
			callback: async (event) => {
				const track = event.options.track - 1
				const clip = event.options.clip - 1
				
				// Request Name
				self.sendOsc('/live/clip/get/name', [
					{ type: 'i', value: track },
					{ type: 'i', value: clip }
				])

				// Request Color
				self.sendOsc('/live/clip/get/color', [
					{ type: 'i', value: track },
					{ type: 'i', value: clip }
				])
			}
		},
		scan_project: {
			name: 'Scan Project',
			options: [],
			callback: async (event) => {
				self.sendOsc('/live/song/get/num_tracks', [])
				self.sendOsc('/live/song/get/num_scenes', [])
			}
		}
	})
}
