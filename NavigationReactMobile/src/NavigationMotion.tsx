import { State, Crumb } from 'navigation';
import * as React from 'react';
import Motion from './Motion';
import Scene from './Scene';
import SharedElementContext from './SharedElementContext';
import withStateNavigator from './withStateNavigator';
import { NavigationMotionProps, SharedItem } from './Props';
type NavigationMotionState = { scenes: { [crumbs: number]: boolean }, rest: boolean };
type SceneContext = { key: number, state: State, data: any, url: string, crumbs: Crumb[], nextState: State, nextData: any, scene: React.ReactElement<any>, mount: boolean };

class NavigationMotion extends React.Component<NavigationMotionProps, NavigationMotionState> {
    private sharedElements: { [scene: number]: { [name: string]: { ref: HTMLElement; data: any }; }; } = {};
    private sharedElementContext: any;
    constructor(props) {
        super(props);
        this.sharedElementContext = {
            registerSharedElement: (scene, name, ref, data) => {
                this.sharedElements[scene] = this.sharedElements[scene] || {};
                this.sharedElements[scene][name] = {ref, data};
            },
            unregisterSharedElement: (scene, name) => {
                if (this.sharedElements[scene])
                    delete this.sharedElements[scene][name];
            },
        }
        var scenes = {};
        var {state, crumbs} = this.props.stateNavigator.stateContext;
        if (state)
            scenes[crumbs.length] = true;
        this.state = {scenes, rest: false};
    }
    static defaultProps = {
        duration: 300
    }
    static getDerivedStateFromProps({stateNavigator}, {scenes: prevScenes}) {
        var {state, data, crumbs} = stateNavigator.stateContext;
        var scenes = {...prevScenes, [crumbs.length]: true};
        return {scenes, rest: false};
    }
    getSharedElements(crumbs, oldUrl) {
        if (oldUrl === null || crumbs.length === oldUrl.split('crumb=').length - 1)
            return [];
        var oldSharedElements = this.sharedElements[oldUrl.split('crumb=').length - 1];
        var mountedSharedElements = this.sharedElements[crumbs.length];
        var sharedElements: SharedItem[] = [];
        for(var name in mountedSharedElements) {
            if (oldSharedElements && oldSharedElements[name]) {
                sharedElements.push({
                    name,
                    oldElement: oldSharedElements[name],
                    mountedElement: mountedSharedElements[name]
                });
            }
        }
        return sharedElements;
    }
    clearScene(index) {
        this.setState(({rest: prevRest}) => {
            var scene = this.getScenes().filter(scene => scene.key === index)[0];
            if (!scene)
                delete this.sharedElements[index];
            var rest = prevRest || (scene && scene.mount);
            return rest !== prevRest ? {rest} : null;
        });
    }
    getScenes(): SceneContext[]{
        var {stateNavigator} = this.props;
        var {crumbs, nextCrumb} = stateNavigator.stateContext;
        return crumbs.concat(nextCrumb).map(({state, data, url}, index, crumbsAndNext) => {
            var preCrumbs = crumbsAndNext.slice(0, index);
            var {state: nextState, data: nextData} = crumbsAndNext[index + 1] || {state: undefined, data: undefined};
            var {scenes} = this.state;
            var scene = scenes[index] ? <Scene index={index} crumbs={crumbs.length}>{state.renderScene(data)}</Scene> : null;
            return {key: index, state, data, url, crumbs: preCrumbs, nextState, nextData, scene, mount: url === nextCrumb.url};
        });
    }
    getStyle(mounted: boolean, {state, data, crumbs, nextState, nextData, mount}: SceneContext) {
        var {unmountedStyle, mountedStyle, crumbStyle} = this.props;
        var styleProp = !mounted ? unmountedStyle : (mount ? mountedStyle : crumbStyle)
        return typeof styleProp === 'function' ? styleProp(state, data, crumbs, nextState, nextData) : styleProp;
     }
    render() {
        var {children, duration, sharedElementMotion, stateNavigator} = this.props;
        var {stateContext: {crumbs, oldUrl, oldState}, stateContext} = stateNavigator;
        var SceneMotion: new() => Motion<SceneContext> = Motion as any;
        return (stateContext.state &&
            <SharedElementContext.Provider value={this.sharedElementContext}>
                <SceneMotion
                    data={this.getScenes()}
                    getKey={({key}) => key}
                    enter={scene => this.getStyle(!oldState, scene)}
                    update={scene => this.getStyle(true, scene)}
                    leave={scene => this.getStyle(false, scene)}
                    onRest={({key}) => this.clearScene(key)}
                    duration={duration}>
                    {tweenStyles => (
                        tweenStyles.map(({data: {key, state, data, url, scene}, style: tweenStyle}) => (
                            children(tweenStyle, scene, key, crumbs.length === key, state, data)
                        )).concat(
                            sharedElementMotion && sharedElementMotion({
                                key: 'sharedElements',
                                sharedElements: !this.state.rest ? this.getSharedElements(crumbs, oldUrl) : [],
                                progress: tweenStyles[crumbs.length] && tweenStyles[crumbs.length].progress,
                                duration,
                            })
                        )
                    )}
                </SceneMotion>
            </SharedElementContext.Provider>
        );
    }
}

export default withStateNavigator(NavigationMotion);
