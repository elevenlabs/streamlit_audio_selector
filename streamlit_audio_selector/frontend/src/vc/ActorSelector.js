import React from 'react';

export class VoiceActor {
    constructor(name, imgSrc, sampleSrc=null) {
        this.name = name
        this.imgSrc = imgSrc
        this.sampleSrc = sampleSrc
    }
}

export class VoiceActorSelector extends React.Component {
    constructor(props) {
        super(props);
        console.log("PROPS", props)
        let initialIdx = typeof props.defaultIdx === "number" ? props.defaultIdx : null
        this.state = {
            actors: props.actors || [],
            selected: initialIdx,
        };
        this.select(initialIdx);
    }

    select(idxOrNull) {
        console.log("Selecting...", idxOrNull)
        if (idxOrNull !== this.state.selected) {
            this.setState({selected: idxOrNull})
        }
        if (this.props.onSelect) {
            this.props.onSelect(idxOrNull);
        }
    }


    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.actors !== prevProps.actors) {
            this.setState({actors: this.props.actors || []})
        }
    }

    render() {
        let actors = [];
        let i = 0
        for (let actor of this.state.actors) {
            let classes = ["actor"]
            let selected = i === this.state.selected;
            if (selected) {
                console.log("SELECTED!", i)
                classes.push("actor--selected")
            }
            let it = i;
            actors.push(
                <div key={it}>
                    <figure className={classes.join(" ")} onClick={() => {
                        console.log("selecting", it);
                        this.select(it)
                    }}>
                        <img src={actor.imgSrc} alt={actor.name}/>
                        <figcaption>{actor.name}</figcaption>
                    </figure>
                </div>);
            i++;
        }
        return <div className="actor-grid">
            {actors}
        </div>
    }
}
