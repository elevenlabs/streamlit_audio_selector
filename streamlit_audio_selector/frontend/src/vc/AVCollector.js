import MediaRecorder from 'opus-media-recorder';
import React from 'react';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import PlayCircleOutline from '@material-ui/icons/PlayCircleOutline';
import CheckCircleOutline from '@material-ui/icons/CheckCircleOutline';
import LinearProgress from '@material-ui/core/LinearProgress';


console.log("Public URL: ", process.env.PUBLIC_URL)
// console.log("Public URL: ", XYZ)
// Non-standard options
const workerOptions = {
    encoderWorkerFactory: function () {
        return new Worker(process.env.PUBLIC_URL + '/opus-media-recorder/encoderWorker.umd.js')
    },
    // OggOpusEncoderWasmPath: OggOpusWasm,
    // WebMOpusEncoderWasmPath: WebMOpusWasm
};

export class AVCollector extends React.Component {
    constructor(props) {
        super(props);
        this.audioChunks = []
        this.mediaRecorder = null
        this.maxDurationSecs = this.props.maxDurationSecs || -1
        this.state = {
            isUnsupported: !window.navigator || !window.navigator.mediaDevices || !window.navigator.mediaDevices.getUserMedia,
            isRecording: false,
            stream: null,
        };
        this.didUserInit = false
        this.enableAnalyzer = false
        this.recordingTimeoutId = null
    }

    componentDidMount() {
        if (this.didUserInit) {
            this.initMediaRecorder()
        }
    }

    initMediaRecorder(afterSuccess) {
        this.didUserInit = true
        let onSuccess = (stream) => {
            this.stream = stream
            console.log("Audio track details:")
            console.log("Settings :", this.stream.getAudioTracks()[0].getSettings())
            console.log("Capabilities :", this.stream.getAudioTracks()[0].getCapabilities())
            console.log("Constraints :", this.stream.getAudioTracks()[0].getConstraints())
            this.mediaRecorder = new MediaRecorder(stream, {mimeType: 'audio/wave' }, workerOptions)
            this.mediaRecorder.ondataavailable = (e) => {
                this.audioChunks.push(e.data)
            }
            this.mediaRecorder.onstop = (e) => {
                this.finishRecording()
            }
            this.setState({
                stream: stream,
            })
            if (afterSuccess) {
                afterSuccess()
            }

        }

        let onError = (err) => {
            console.log('Could not init audio recorder!: ' + err);
            this.setState({
                isRecording: false,
                isUnsupported: true,
            })

        }
        // {sampleRate: 16000}
        navigator.mediaDevices.getUserMedia({audio: true}).then(onSuccess, onError)
    }

    startRecording() {
        if (this.state.isRecording) {
            console.log("Already recording, cannot start again.")
            return
        }
        if (!this.didUserInit) {
            this.initMediaRecorder(() => this.startRecording())
            return
        }
        this.setState({
            isRecording: true,
        })
        if (this.maxDurationSecs > 0) {
            this.recordingTimeoutId = setTimeout(()=>{
                console.log("Audio duration exceeded max, stopped!")
                this.stopRecording()}, this.maxDurationSecs*1000)
        }
        this.mediaRecorder.start()
        if (typeof this.props.onRecordingStarted == "function") {
            this.props.onRecordingStarted()
        }

    }

    stopRecording() {
        if (this.recordingTimeoutId) {
            clearTimeout(this.recordingTimeoutId)
            this.recordingTimeoutId = null
        }
        if (!this.state.isRecording) {
            console.log("No recording to stop - not recording")
            return
        }
        this.mediaRecorder.stop()
        this.mediaRecorder.stream.getTracks().forEach(i => i.stop());
        this.didUserInit = false
        console.log(`Recording stopped, got ${this.audioChunks.length} chunks already, more can come...`)
    }

    finishRecording() {
        console.log(`Recording fully stopped, got ${this.audioChunks.length} chunks.`)
        const blob = new Blob(this.audioChunks, {'type': 'audio/wav'})
        this.audioChunks = []
        const audioURL = window.URL.createObjectURL(blob);
        this.setState({
            isRecording: false,
        })
        if (typeof this.props.onAudioCollected == "function") {
            this.props.onAudioCollected(audioURL, blob)
        }
    }

    render() {
        if (this.state.isUnsupported) {
            return <div><h1> Audio collection not supported or not allowed. </h1> <h2>Please check your device
                settings. </h2></div>
        }
        return (
            <Box>
                {/*<RTAudioAnalyser stream={this.enableAnalyzer ? this.state.stream : null} pause={!this.state.isRecording}/>*/}
                <Button size="large" color={!this.state.isRecording ? "primary" : "secondary"} variant="contained"
                        startIcon={!this.state.isRecording ? <PlayCircleOutline/> : <CheckCircleOutline/>}
                        fullWidth={true} onClick={() => {
                    if (this.state.isRecording) {
                        this.stopRecording();
                    } else {
                        this.startRecording()
                    }
                }}> {!this.state.isRecording ? "Start Recording" : "Stop Recording"}</Button>
                {this.state.isRecording ? <div><br/><LinearProgress />  <br/>Recording...{this.maxDurationSecs > 0 ? <p>Max allowed length: {this.maxDurationSecs} seconds. </p> : null} </div> : null}
            </Box>

        );
    }
}