class Webcam {
	constructor(webcamElement, facingMode = 'user', canvasElement = null, snapSoundElement = null) {
		this._webcamElement = webcamElement;
		this._webcamElement.width = this._webcamElement.width || 640;
		this._webcamElement.height = this._webcamElement.height || this._webcamElement.width * (3 / 4);
		this._facingMode = facingMode;
		this._webcamList = [];
		this._streamList = [];
		this._selectedDeviceId = '';
		this._canvasElement = canvasElement;
		this._snapSoundElement = snapSoundElement;
		this._horizontalFlipFactor = 1;
	}
	get facingMode() {
		return this._facingMode;
	}
	set facingMode(value) {
		this._facingMode = value;
	}
	get webcamList() {
		return this._webcamList;
	}
	get webcamCount() {
		return this._webcamList.length;
	}
	get selectedDeviceId() {
		return this._selectedDeviceId;
	}
	/* Get all video input devices info */
	getVideoInputs(mediaDevices) {
		this._webcamList = [];
		mediaDevices.forEach(mediaDevice => mediaDevice.kind === 'videoinput' && this._webcamList.push(mediaDevice));
		this._webcamList.length == 1 && (this._facingMode = 'user');
		return this._webcamList;
	}
	/* Get media constraints */
	getMediaConstraints() {
		const videoConstraints = {};
		if (this._selectedDeviceId == '') {
			videoConstraints.facingMode = this._facingMode;
		} else {
			videoConstraints.deviceId = { exact: this._selectedDeviceId };
		}
		return {
			video: videoConstraints,
			audio: false
		};
	}
	/* Select camera based on facingMode */
	selectCamera() {
		for (let webcam of this._webcamList) {
			if ((this._facingMode == 'user' && webcam.label.toLowerCase().includes('front')) || (this._facingMode == 'enviroment' && webcam.label.toLowerCase().includes('back'))) {
				this._selectedDeviceId = webcam.deviceId;
				break;
			}
		}
	}
	/* Horizontally flip the current streaming camera */
	flip() {
		this._horizontalFlipFactor *= -1;
		this.caliberateWebCamElement();
	}
	caliberateWebCamElement() {
		this._webcamElement.style.transform = this._horizontalFlipFactor === -1 ? `scale(-1, 1)` : '';
	}
	/* Change Facing mode and selected camera */
	switchCamera() {
		this._facingMode = (this._facingMode == 'user') ? 'enviroment' : 'user';
		this._webcamElement.style.transform = "";
		this.selectCamera();
	}
	/*
		1. Get permission from user
		2. Get all video input devices info
		3. Select camera based on facingMode 
		4. Start stream
	*/
	async start(startStream = true) {
		return new Promise((resolve, reject) => {
			this.stop();
			this.info() //get all video input devices info
				.then(webcams => {
					this.selectCamera(); //select camera based on facingMode
					if (startStream) {
						this.stream().then(resolve).catch(reject);
					} else {
						resolve(this._selectedDeviceId);
					}
				}).catch(reject);
		});
	}
	/* Get all video input devices info */
	async info() {
		return navigator.mediaDevices.enumerateDevices().then(devices => this.getVideoInputs(devices));
	}
	/* Start streaming webcam to video element */
	async stream() {
		return navigator.mediaDevices.getUserMedia(this.getMediaConstraints()).then(stream => {
			this._streamList.push(stream);
			this._webcamElement.srcObject = stream;
			if (this._facingMode == 'user' && !this._isStopped) this._horizontalFlipFactor = -1;
			this.caliberateWebCamElement();
			delete this._isStopped;
			this._webcamElement.play();
			return this._facingMode;
		});
	}
	/* Stop streaming webcam */
	stop() {
		this._streamList.forEach(stream => stream.getTracks().forEach(track => track.stop()));
		this._isStopped = true;
	}
	snap() {
		if (this._canvasElement != null) {
			if (this._snapSoundElement != null) {
				this._snapSoundElement.onpause = () => this._snapSoundElement.currentTime = 0;
				this._snapSoundElement.currentTime = 0;
				this._snapSoundElement.play();
			}
			this._canvasElement.height = this._webcamElement.scrollHeight;
			this._canvasElement.width = this._webcamElement.scrollWidth;
			const context = this._canvasElement.getContext('2d');
			if (this._horizontalFlipFactor === -1) {
				context.translate(this._canvasElement.width, 0);
				context.scale(-1, 1);
			}
			context.clearRect(0, 0, this._canvasElement.width, this._canvasElement.height);
			context.drawImage(this._webcamElement, 0, 0, this._canvasElement.width, this._canvasElement.height);
			return this._canvasElement.toDataURL('image/png');
		} else {
			throw "canvas element is missing";
		}
	}
}
window.Webcam = Webcam;
export default Webcam;