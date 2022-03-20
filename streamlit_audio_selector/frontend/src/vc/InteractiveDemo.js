import React from "react";
import {VoiceActor} from "./ActorSelector";
import {VoiceActorSelector} from "./ActorSelector";
import {PlayerUI} from "./PlayerUI";
import {VCDemo} from "./Demo";
import {AVCollector} from "./AVCollector"
import CircularProgress from '@material-ui/core/CircularProgress';


const VCDemoState = {
    recording: 1,
    converting: 2,
    resultsReady: 3,
    error: 4
}

export class InteractiveVCDemo extends React.Component {
    constructor(props) {
        super(props);
        this.targetActors = props.targetActors
        this.maxDurationSecs = this.props.maxDurationSecs || -1

        this.state = {
            state: VCDemoState.recording,
            sourceSrc: null,
            sourceBlob: null,
            convertedSrcs: {},
            errorMsg: null,
        }
    }

    componentDidMount() {
    }

    collectConversionForTarget(targetId, srcBlob) {
        let targetSampleSrc = this.targetActors[targetId].sampleSrc
        fetch(targetSampleSrc).then(
            (r) => {
                if (!r.ok) {
                    throw new TypeError(`Failed to fetch target sample src: ${targetSampleSrc}`)
                }
                return r.blob()
            }
        ).then(
            (targetBlob) => {
                const form = new FormData();
                form.append("source", srcBlob);
                form.append("target", targetBlob);
                return fetch("https://www.speechapi.io/v1/voice/custom-convert",
                    {
                        body: form,
                        method: "post"
                    });
            }
        ).then((r) => {
                if (!r.ok) {
                    console.log(r)
                    throw new TypeError("The conversion backend failed for this request... See the network dbg or console. ")
                }
                return r.blob()
            }
        ).then(
            (convertedBlob) => {
                console.log("GOT IT for target:", targetId, convertedBlob)
                let convertedSrc = URL.createObjectURL(convertedBlob)
                this.setState({convertedSrcs: {...this.state.convertedSrcs, [targetId]: convertedSrc}})
                if (Object.getOwnPropertyNames(this.state.convertedSrcs).length === this.targetActors.length) {
                    this.setState({state: VCDemoState.resultsReady})
                }
            }
        ).catch(
            (err) => {
                console.log("Conversion failed for target", targetId, this.targetActors[targetId], err)
                this.setState({
                    sate: VCDemoState.error,
                    errorMsg: "Conversion failed, please try again with a shorter sample (or report an issue in case that fails as well)."
                })
            }
        )


    }

    onRecordingStop(blobUrl, blob) {
        console.log(blob, typeof blob)
        this.setState({state: VCDemoState.converting, sourceSrc: blobUrl, sourceBlob: blobUrl})
        for (let i = 0; i < this.targetActors.length; i++) {
            this.collectConversionForTarget(i, blob)
        }

    }

    render() {
        let avCollector = <AVCollector
            maxDurationSecs={this.maxDurationSecs}
            onAudioCollected={(audioURL, blob) => {
                this.onRecordingStop(audioURL, blob)
            }}
            onRecordingStarted={() => {
                this.setState({state: VCDemoState.recording, sourceSrc: null, convertedSrcs: {}})
            }}
        />;
        let contents;
        switch (this.state.state) {
            case VCDemoState.recording:
                contents = null;
                break;
            case VCDemoState.converting:
                contents = <div>
                    <br/>
                    <CircularProgress/>
                    <br/>
                    Converting audio, please wait...
                    <br/>
                    <br/>
                    <div>
                        Your recording preview:
                    <audio src={this.state.sourceSrc} type="audio/wav" controls/>
                    </div>
                </div>;
                break;
            case VCDemoState.resultsReady:
                let actors = [new VoiceActor("Original", "actors/person.jpeg"), ...this.targetActors]
                let audioSrcs = [this.state.sourceSrc]
                for (let i = 0; i < this.targetActors.length; i++) {
                    audioSrcs.push(this.state.convertedSrcs[i])
                }
                contents = <VCDemo
                    audioSrcs={audioSrcs}
                    actors={actors}
                    useWaveformSlider={true}/>
                break;
            case VCDemoState.error:
                contents = <div>
                    <br/>
                    We are Sorry. Errors Occurred 🤯
                    <p> {this.state.errorMsg} </p>
                </div>
                break
            default:
                contents = <p> Unknown state... {this.state.state}</p>
        }

        return <div>
            {avCollector}
            {contents}
        </div>
    }
}




