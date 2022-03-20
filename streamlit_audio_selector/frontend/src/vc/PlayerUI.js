import React from 'react';
import {FormattedTime} from 'react-player-controls'
import Slider from '@material-ui/core/Slider';
import IconButton from '@material-ui/core/IconButton';
import PlayCircleFilled from "@material-ui/icons/PlayCircleFilled";
import PauseCircleFilled from "@material-ui/icons/PauseCircleFilled";
import WaveSurfer from 'wavesurfer.js';
import {CircularProgress} from "@material-ui/core";


export class PlayerUI extends React.Component {
    constructor(props) {
        super(props);
        // OUT events: onPlay, onPause, onSeek
        // IN events: updateProgress

        this.audioSliderSrc = props.audioSliderSrc
        this.waveformSlider = null
        this.waveformSliderRef = React.createRef();

        this.state = {
            playing: false,
            progress: 0.0,
            time: 0.0,
            totalTime: 0.0,
            trigger: 0.0,
        }
        this.sliderRef = React.createRef();
    }

    initWaveformSlider() {
        if (this.waveformSlider) {
            return
        }
        let xhr = { cache: 'default', mode: 'no-cors'};
        this.waveformSlider = WaveSurfer.create({
            container: this.waveformSliderRef.current,
            waveColor: 'violet',
            progressColor: 'purple',
            responsive: true,
            xhr: xhr,
        });
        this.waveformSlider.load(this.audioSliderSrc)
        // Mute entirely, the audio actually plays elsewhere.
        this.waveformSlider.setMute(true);
        this.waveformSlider.on("seek", (frac) => {
            console.log("Seeek!")
            this.seek(frac, false)
            // Make sure the state is in sync...
            if (this.state.playing !== this.waveformSlider.isPlaying()) {
                console.log("Warning waveform slider state not in sync with the player, syncing to playing:", this.state.playing)
                if (this.state.playing) {
                    this.waveformSlider.play()
                } else {
                    this.waveformSlider.pause()
                }

            }
        })
        this.setState({trigger: Math.random()})

    }

    componentDidMount() {
        if (this.audioSliderSrc) {
            this.initWaveformSlider()
        }

    }

    updateProgress(time, totalTime) {
        let frac = time / totalTime;
        this.setState({progress: frac, time: time, totalTime: totalTime})
        if (frac >= 1.0 && this.state.playing) {
            this.pause()
        }
    }

    seek(frac, updateWaveformSlider = true) {
        this.props.onSeek(frac)
        if (this.waveformSlider && updateWaveformSlider) {
            this.waveformSlider.seekTo(frac)
        }
    }

    play() {
        if (this.state.progress >= 1.0) {
            this.seek(0)
        }
        this.setState({playing: true})
        this.props.onPlay()
        if (this.waveformSlider) {
            this.waveformSlider.play()
        }
    }

    pause() {
        this.setState({playing: false})
        this.props.onPause()
        if (this.waveformSlider) {
            this.waveformSlider.pause()
        }
    }


    render() {
        return <div className="player-ui">
            {this.audioSliderSrc ?
                <div className="waveform-slider" ref={this.waveformSliderRef} style={{width: "100%"}}/> : null}
            {this.waveformSlider ? null : <Slider
                value={Math.max(Math.min(this.state.progress * 100, 100), 0)}
                onChange={(e, v) => this.seek(v / 100)}
                aria-label="small"
                valueLabelDisplay="off"

            />}
            <br/>
            {this.state.totalTime > 0 ?
                <span className="player-controls">
                    <IconButton onClick={() => {
                        if (this.state.playing) {
                            this.pause()
                        } else {
                            this.play()
                        }
                    }}> {!this.state.playing ? <PlayCircleFilled className="player-button"/> :
                        <PauseCircleFilled className="player-button"/>} </IconButton>
                <div className="player-time"><FormattedTime numSeconds={this.state.time}/> / <FormattedTime
                    numSeconds={this.state.totalTime}/> </div>
            </span> :
                <CircularProgress/>
            }
        </div>
    }
}
