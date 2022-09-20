import React from 'react'
import { observer, inject } from 'mobx-react'

interface AnimationProps {
    images: String[]
    speed?: number
}
interface AnimationState {
    images?: String[]
    currentImage: String
    position: number
}
@inject('dviceStore')
@observer
export default class Animation extends React.Component<AnimationProps, AnimationState> {
    constructor(props) {
        super(props) 
        this.state = {
            images: this.props.images,
            currentImage: this.props.images[0],
            position: 0
        }
    }
    componentDidMount() {
        this.animation()
    }
    componentDidUpdate() {
        if (this.state.images !== this.props.images) {
            this.setState({
                images: this.props.images
            })
        }
    }
    animation() {
        setInterval(() => {
            const {images, position} = this.state
            const newPosition = position + 1
            if(images !== undefined) {
                if(images[newPosition] === undefined){
                    this.setState({
                        currentImage: images[0],
                        position: 0
                    })
                } else {
                    this.setState({
                        currentImage: images[newPosition],
                        position: newPosition
                    })
                }
            }
        }, this.props.speed || 700)
    }
    render() {
        const {currentImage} = this.state
        return (
            <>
                <img src = {require(`./img/${currentImage}.png`)} draggable = 'false' alt = {`${currentImage}`} />
            </>
        )
    }
}
