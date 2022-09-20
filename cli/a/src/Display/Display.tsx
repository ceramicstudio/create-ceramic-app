import React from 'react'
import './Display.scss'
import {observer, inject} from 'mobx-react'

import speechBubble from "./img/needs/speechBubble.png"
import digitama from "./img/digitama.png"
import Animation from "../Animation/Animation"
import Partner from "../Partner/Partner"

@inject('dviceStore')
@observer
export default class Display extends React.Component {
    render(){
        const wastePiles = new Array(this.props["dviceStore"].poopCount).fill(null)

        const {sick, hunger} = this.props["dviceStore"].needs

        let sickRender, hungerRender
        if(sick ===1) {
            sickRender = 
                <div className = "bubble" style = {{background: `url(${speechBubble}) center center / cover no-repeat`}}>
                    <Animation images = {['needs/needle_1', 
                    'needs/needle_2']} speed = {500} />
                </div>
        }
        if (hunger >= 1) {
            hungerRender = 
                <div className = "bubble" style = {{background: `url(${speechBubble}) center center / cover no-repeat`}}>
                    <Animation images = {['needs/Meat_full', 
                    'needs/meat_3', 
                    'needs/meat_2', 
                    'needs/meat_1']} speed = {800} />
                </div>
        }
        if(this.props["dviceStore"].isDead === true) {
            const partners = [
                'v1/botamon', 
                'v2/punimon', 
                'v3/poyomon', 
                'v4/yuramon', 
                'v5/zurumon', 
                // 'unlock/sakumon', 
                'unlock/petitmon', 
                'unlock/pitchmon', 
                'unlock/dodomon', 
                'unlock/yukimibotamon'
            ]
            return(
                <div className = "Display">
                    <h1>Your partner has passed away. Please select a new egg.</h1>
                    <div className = "eggContainer">
                        {
                            partners.map((partner, id) => {
                                const partnerInfo = partner.split('/')
                                return (
                                    <div 
                                        className = "egg" 
                                        style = {{background: `url(${digitama}) center center / cover no-repeat`}} 
                                        key = {id}
                                        onClick = {() => {
                                            this.props["dviceStore"].setVersion(partnerInfo[0], partnerInfo[1])}
                                        }
                                    >
                                        <Animation images = {[`Partners/${partner}_1`, `Partners/${partner}_2`]} />
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            )
        } else {
            return (
                <div className = "Display">
                    <div className = "toilet">
                        <div className = "wastePiles">
                            {
                                (wastePiles).map((waste, id) => {
                                    return (
                                        <Animation images = {['needs/poop_1', 
                                        'needs/poop_2', 
                                        'needs/poop_3', 
                                        "needs/poop_2"]} speed = {500} key = {id}/>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div className = "container">
                        <div className = "needs">
                            {sickRender}
                            {hungerRender}
                        </div>
                        <div className = "partner">
                            <Partner />
                        </div>
                    </div>
                </div>
            )
        }
    }
}
