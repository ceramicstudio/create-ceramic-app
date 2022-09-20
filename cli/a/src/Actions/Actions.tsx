import React from 'react'
import {observer, inject} from 'mobx-react'

import Animation from "../Animation/Animation"

import './Actions.scss'

@inject('dviceStore')
@observer
export default class Actions extends React.Component {

    render() {
        return (
            <div className = "actionsContainer">
                <div className = "Actions">
                    <div className = "button" onClick = {this.props["dviceStore"].cleanPoop}>
                        <Animation images = {['needs/poop_1', 'needs/poop_2', 'needs/poop_3', "needs/poop_2"]} speed = {500} /> 
                        Clean
                    </div>
                    <div className = "button" onClick = {this.props["dviceStore"].feedDigi}>
                        <Animation images = {['needs/Meat_full', 'needs/meat_3', 'needs/meat_2', 'needs/meat_1']} speed = {800} /> 
                        Feed
                    </div>
                    <div className = "button" onClick = {this.props["dviceStore"].medicine}>
                        <Animation images = {['needs/needle_1', 'needs/needle_2']} speed = {500} /> 
                        Medicine
                    </div>
                    <div className = "button" onClick = {this.props["dviceStore"].sleep}>
                        <Animation images = {['needs/sleep_1', 'needs/sleep_2', 'needs/sleep_3']} speed = {500} /> 
                        Sleep
                    </div>
                </div>
                <div className = "Actions">
                    <div className = "button" onClick = {() => { this.props["dviceStore"].train("offense")}}>
                        Offense
                    </div>
                    <div className = "button" onClick = {() => { this.props["dviceStore"].train("defense")}}>
                        Defense
                    </div>
                    <div className = "button" onClick = {() => { this.props["dviceStore"].train("speed")}}>
                        Speed
                    </div>
                    <div className = "button" onClick = {() => { this.props["dviceStore"].train("brains")}}>
                        Brains
                    </div>
                    {/* <div className = "button" onClick = {() => { this.props["dviceStore"].setVersion('v2')}}>
                        Version
                    </div>
                    <div className = "button" onClick = {() => {this.props["dviceStore"].species()}}>
                        Evolve
                    </div>
                    <div className = "button" onClick = {this.props["dviceStore"].death()}>
                        Death
                    </div> */}
                </div>
            </div>
        )
    }
}