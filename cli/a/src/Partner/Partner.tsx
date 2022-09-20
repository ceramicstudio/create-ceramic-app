import React from 'react'

import {observer, inject} from 'mobx-react'
import Animation from "../Animation/Animation"

@inject('dviceStore')
@observer
export default class Partner extends React.Component {
    render() {
        let renderEating
        if(this.props["dviceStore"].isEating === true) {
            renderEating = <Animation images = {['needs/Meat_full', 'needs/meat_3', 'needs/meat_2', 'needs/meat_1']} speed = {800} />
        }
        return (
            <div className = "partner">
                {renderEating}
                <Animation images = {this.props["dviceStore"].partnerImages} speed = {700}/>
            </div>
        )
    }
}