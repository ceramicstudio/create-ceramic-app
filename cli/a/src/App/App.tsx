import React from 'react';
import './App.scss';
import Display from "../Display/Display"
import Actions from "../Actions/Actions"

import { observer, inject } from "mobx-react"
import { DateTime } from "luxon"

import background from "./background_night.png"
import data from "./evolutions.json"
@inject('dviceStore')
@observer
export default class App extends React.Component{
  componentDidMount() {
    this.timer()
    this.evoCheck()
    this.wasteCheck()
    this.foodCheck()
    this.props["dviceStore"].setStore()
  }
  timer() {
    setInterval(() => {
      this.evoCheck()
      this.wasteCheck()
      this.foodCheck()
      this.props["dviceStore"].setStore()
    }, 60000)
  }
  wasteCheck() {
    if(this.props["dviceStore"].nextPoopTime <= DateTime.local().toSeconds()) {
      this.props["dviceStore"].poop()
      this.props["dviceStore"].nextPoopTime = DateTime.local().plus({hours: 1}).toSeconds()
    }
  }
  foodCheck() {
    if(this.props["dviceStore"].nextHungerTime <= DateTime.local().toSeconds()) {
      this.props["dviceStore"].hungryDigi()
      this.props["dviceStore"].nextHungerTime = DateTime.local().plus({hours: 1}).toSeconds()
    }
  }
  evoCheck() {
    this.props["dviceStore"].species()
  }

  render() {
    return (
      <div className ="App" style = {{
        background: `url(${background}) center bottom / cover no-repeat`
      }}>
        <Actions />
        <Display />
      </div>
    )
  }
}
