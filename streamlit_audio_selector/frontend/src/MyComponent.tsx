import {
    Streamlit,
    StreamlitComponentBase,
    withStreamlitConnection,
} from "streamlit-component-lib"
import React, {ReactNode} from "react"
import {VCDemo} from "./vc/Demo.js"
import {VoiceActor} from "./vc/ActorSelector";
import "./vc/Styles.css"

interface State {
    ready: Boolean
}

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

/**
 * This is a React-based component template. The `render()` function is called
 * automatically when your component should be re-rendered.
 */
class MyComponent extends StreamlitComponentBase<State> {
    public state = {ready: false}

    public componentDidMount() {
        super.componentDidMount();
        // setTimeout(()=>Streamlit.setComponentValue(1), 100)
    }

    public render = (): ReactNode => {
        // Arguments that are passed to the plugin in Python are accessible
        // via `this.props.args`. Here, we access the "name" arg.
        const actors = this.props.args["actors"].map((e: any) => new VoiceActor(e.name, e.img_src, e.sample_src));
        const audioSrcs = this.props.args["audio_srcs"];
        const videoSrc = this.props.args["video_src"];
        const useWaveformSlider = this.props.args["use_wavesurfer_slider"];

        const demo = <VCDemo audioSrcs={audioSrcs}
                             actors={actors}
                             onReady={() => {
                                 if (!this.state.ready) {
                                     console.log("Ready!!!!")
                                     this.setState({ready: true})
                                     setTimeout(() => Streamlit.setComponentValue(1), 300)
                                 }
                             }}

                             useWaveformSlider={useWaveformSlider}
                             videoSrc={videoSrc}
        />;
        return (
            // @ts-ignore
            <center>{demo}</center>
        )
    }

}

// "withStreamlitConnection" is a wrapper function. It bootstraps the
// connection between your component and the Streamlit app, and handles
// passing arguments from Python -> Component.
//
// You don't need to edit withStreamlitConnection (but you're welcome to!).
export default withStreamlitConnection(MyComponent)
