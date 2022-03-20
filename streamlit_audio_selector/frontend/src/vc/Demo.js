import React from 'react';
import {VoiceActorSelector} from "./ActorSelector";
import {PlayerUI} from "./PlayerUI";


// <VCDemo audioSrcs={[
//     "/vc/samples/potter_long_converted_original.mp3",
//     "/vc/samples/potter_long_converted_david.mp3",
//     "/vc/samples/potter_long_converted_hilary.mp3",
//     "/vc/samples/potter_long_converted_obama.mp3",
// ]} actors={[new VoiceActor("Original", "/actors/obama.jpg"),
//     new VoiceActor("David", "/actors/obama.jpg"),
//     new VoiceActor("Hilary", "/actors/obama.jpg"),
//     new VoiceActor("Obama", "/actors/obama.jpg")]}
//         useWaveformSlider={true} videoSrc={null}
// />

export class VCDemo extends React.Component {
    constructor(props) {
        super(props);
        this.audiosRef = React.createRef();
        this.audioSrcs = props.audioSrcs
        this.videoSrc =  props.videoSrc
        this.useWaveformSlider = !!props.useWaveformSlider
        this.onReady = props.onReady
        // if (this.videoSrc && !this.videoSrc.endsWith(".mp4")) {
        //     throw Error("videoSrc must be an mp4 file.")
        // }
        this.audios = [];
        this.mediasReady = {}
        this.playerUIRef = React.createRef();
        this.videoPlayerRef = React.createRef();


        this.selectedTrack = 0;

        this.state = {
            ready: false,
            actors: this.props.actors
        }

    }

    componentDidMount() {
        this.audios = [];
        for (let audio of this.audiosRef.current.children) {
            console.log(audio)
            this.audios.push(audio)
        }
    }

    markMediaReady(i) {
        this.mediasReady[i] = true
        console.log("Audio ready:", i)
        if (Object.getOwnPropertyNames(this.mediasReady).length === (this.audioSrcs.length + (this.videoSrc ? 1 : 0))) {
            this.setState({ready: true})
            this.selectTrack(this.selectedTrack)
            if (this.onReady) {
                this.onReady()
            }
        }
    }

    play() {
        for (let audio of this.audios) {
            console.log('play')
            audio.play()
        }
        if (this.videoPlayerRef.current) {
            this.videoPlayerRef.current.muted = true;
            this.videoPlayerRef.current.play()
        }
    }

    pause() {
        for (let audio of this.audios) {
            console.log('pause')
            audio.pause()
        }
        if (this.videoPlayerRef.current) {
            this.videoPlayerRef.current.pause()
        }
        if (this.audios.length > 0) {
            // Sync all the media to the first one, just in case they go out of sync.
            this.seek(this.audios[0].currentTime / this.audios[0].duration)
        }


    }

    seek(frac) {
        if (this.audios.length <= 0) {
            return
        }
        frac = Math.min(Math.max(frac, 0), 1)
        let currentTime = frac * this.audios[0].duration;
        for (let audio of this.audios) {
            console.log('seek')
            audio.currentTime = currentTime
        }
        if (this.videoPlayerRef.current) {
            this.videoPlayerRef.current.currentTime = currentTime
        }
    }

    selectTrack(i) {
        console.log("selected track", i)
        this.selectedTrack = i;
        let idx = 0;
        for (let audio of this.audios) {
            audio.muted = idx !== this.selectedTrack;
            console.log(audio.volume)
            idx++;
        }

    }

    render() {
        let audios = [];
        for (let audioSrc of this.audioSrcs) {
            let extra = {}
            if (audios.length === 0) {
                extra["onTimeUpdate"] = (e) => this.playerUIRef.current.updateProgress(e.target.currentTime, e.target.duration)
                extra["onDurationChange"] = (e) => this.playerUIRef.current.updateProgress(e.target.currentTime, e.target.duration)
                extra["onEnded"] = (e) => this.playerUIRef.current.updateProgress(e.target.currentTime, e.target.duration)
            }
            audios.push(
                <audio src={audioSrc} preload="auto" onCanPlayThrough={() => {
                    this.markMediaReady(audioSrc)
                }} key={audioSrc} {...extra}/>);
        }
        return (<div className="vcdemo">
            <br/>
            {this.videoSrc ? <video src={this.videoSrc} playsInline muted preload="auto" type="video/mp4" ref={this.videoPlayerRef} onCanPlayThrough={() => this.markMediaReady("video")}/> : null}
            <PlayerUI onSeek={(frac) => {
                this.seek(frac)
            }} onPlay={() => {
                this.play()
            }} onPause={() => {
                this.pause()
            }} ref={this.playerUIRef} audioSliderSrc={this.useWaveformSlider ? this.audioSrcs[0] : null}/>
            <br/>
            <VoiceActorSelector actors={this.state.actors} defaultIdx={0}
                                onSelect={(idx) => {
                                    this.selectTrack(idx)
                                }}/>
            <div ref={this.audiosRef}>
                {audios}
            </div>
        </div>)
    }
}


