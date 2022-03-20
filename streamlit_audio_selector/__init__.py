__all__ = ["audio_selector", "VoiceActor"]
import os
import streamlit.components.v1 as components
from dataclasses import dataclass, asdict
from typing import List, Optional

# When False => run: npm start
# When True => run: npm run build
_RELEASE = True


@dataclass
class VoiceActor:
    name: str
    # Placeholder image.
    img_src: str = "https://picsum.photos/id/903/240/240"
    sample_src: Optional[str] = None

if not _RELEASE:
    _component_func = components.declare_component(
        # We give the component a simple, descriptive name ("my_component"
        # does not fit this bill, so please choose something better for your
        # own component :)
        "audio_selector",
        # Pass `url` here to tell Streamlit that the component will be served
        # by the local dev server that you run via `npm run start`.
        # (This is useful while your component is in development.)
        url="http://localhost:3001",
    )
else:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend/build")
    _component_func = components.declare_component("audio_selector", path=build_dir)



def audio_selector(audio_srcs: List[str], actors: List[VoiceActor], video_src: Optional[str]=None, use_wavesurfer_slider: bool=False, key: Optional[str]=None) -> bool:
    """Nice audio/video player with audio track selection support.

    User can select one of many provided audio tracks (one for each actor) and switch between them in real time.
    All audio tracks (and video of provided) are synchronized.


    Returns:
     False when not yet initialized (something is loading), and True when ready.
    """
    assert len(audio_srcs) > 0
    assert len(audio_srcs) == len(actors), (len(audio_srcs), len(actors))
    component_value = _component_func(
        audio_srcs=audio_srcs,
        actors=[asdict(actor) for actor in actors],
        video_src=video_src,
        use_wavesurfer_slider=use_wavesurfer_slider,
        key=key,
        default=0
    )
    return bool(component_value)



# For development, displays stub audio_selector.
if not _RELEASE:
    import streamlit as st
    actor1_name = st.text_input("Enter a 1st name", value="Actor 1")
    actor2_name = st.text_input("Enter a 2nd name", value="Actor 2")
    num_clicks = audio_selector(
        audio_srcs=["audio.wav", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"],
        actors=[VoiceActor(name=actor1_name), VoiceActor(name=actor2_name, img_src="https://picsum.photos/id/904/240/240")],
        use_wavesurfer_slider=True,

        key="11")
    st.markdown("audio_selector ready? => %s" % bool(num_clicks))
    print('AUDIO', st.audio("frontend/public/audio.wav"))

