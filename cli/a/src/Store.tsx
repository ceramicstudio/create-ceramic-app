import {observable, action, toJS, set } from "mobx"
import {DateTime} from 'luxon'

import data from './App/evolutions.json'
export default class DviceStore {
    @observable poopCount = 0
    @observable lifeCounter = 20
    @observable isEating = false
    @observable firstRun = true
    @observable sleeping = false

    @observable nextPoopTime
    @observable nextHungerTime
    @observable evolutionTime
    @observable isDead

    
    evoTimes = {
        "1": DateTime.local().plus({hours: 1}).toSeconds(),
        "2": DateTime.local().plus({hours: 12}).toSeconds(),
        "3": DateTime.local().plus({days: 2}).toSeconds(),
        "4": DateTime.local().plus({days: 3}).toSeconds(),
        "5": DateTime.local().plus({days: 10}).toSeconds()
    }
    constructor() {
        if(localStorage.store === undefined) {
            this.poopCount = 0
            this.lifeCounter = 20
            let evoTime = DateTime.local().plus({minutes: 10}).toSeconds()
            this.evolutionTime = evoTime
            this.stats = {
                offense: 3,
                defense: 3,
                speed: 3,
                brains: 3,
                stage: 1,
                species: 'botamon',
                version: 'v1'
            }
            this.needs = {
                sick: 0,
                hunger: 0,
                evolving: 0
            }
            this.nextPoopTime   = DateTime.local().plus({minutes: 30}).toSeconds()
            this.nextHungerTime = DateTime.local().plus({minutes: 30}).toSeconds()
            this.isDead = true
        } else {
            set(this, JSON.parse(localStorage.store))
        }
        this.isEating = false
    }

    @observable stats = {
        offense: 3,
        defense: 3,
        speed: 3,
        brains: 3,
        stage: 1,
        species: 'botamon',
        version: 'v1'
    }
    @observable needs = {
        sick: 0,
        hunger: 0,
        evolving: 0
    }
    @observable partnerImages = [
        `Partners/${this.stats.version}/${this.stats.species}_1`,
        `Partners/${this.stats.version}/${this.stats.species}_2`
    ]

    @action.bound cleanPoop() {
        this.poopCount = 0
        this.setStore()
    }
    @action.bound poop() {
        if(this.poopCount < 0) {
            this.poopCount = 0
        } else if (this.poopCount <= 3) {
            this.poopCount++
        } else {
            this.needs.sick = 1
            this.lifeCounter--
            if(this.lifeCounter <= 0) {
                this.death()
            }
        }
        this.setStore()
    }
    @action.bound feedDigi() {
        this.partnerImages = [
            `Partners/${this.stats.version}/${this.stats.species}_eat_1`,
            `Partners/${this.stats.version}/${this.stats.species}_eat_2`
        ]
        this.needs.hunger--
        this.isEating = true
        setTimeout(() => {
            this.updateImages()
            this.setStore()
            this.isEating = false
        }, 5000)
    }
    @action.bound sleep() {
        if(this.sleeping !== true) {
            this.sleeping = true
            this.nextPoopTime += DateTime.local().plus({hours:8}).toSeconds()
            this.nextHungerTime += DateTime.local().plus({hours:8}).toSeconds()
            this.setStore()
        }
    }
    @action.bound hungryDigi() {
        if(this.needs.hunger < 0) {
            this.needs.hunger = 0
        } else if (this.needs.hunger < 4) {
            this.needs.hunger++
        } else {
            this.needs.sick = 1
            this.lifeCounter--
            if(this.lifeCounter >= 0) {
                this.death()
            }
        }
        this.setStore()
    }
    @action.bound medicine() {
        this.needs.sick = 0
        this.setStore()
    }

    @action.bound species() {
        this.updateImages()
        const evoData = data[this.stats.species].evolutions

        if(this.evolutionTime === undefined) {
            this.stats.stage = 1
            this.evolutionTime = this.evoTimes[this.stats.stage]
        }
        evoData.forEach(evo => {
            Object.keys(evo.stats).forEach(targetStats => {
                if(this.stats[targetStats] >= evo.stats[targetStats]) {
                    this.stats.species = evo.name.toLowerCase()
                    this.evolutionTime = this.evoTimes[this.stats.stage]
                    this.updateImages()
                    this.stats.stage++
                }
            })
        })
        this.setStore()
    }
    @action.bound setVersion(version, partner) {
        this.stats.version = version
        this.stats.species = partner
        this.isDead = false
        this.updateImages()
        this.setStore()
    }
    @action updateImages() {
        this.partnerImages =  [
            `Partners/${this.stats.version}/${this.stats.species}_1`,
            `Partners/${this.stats.version}/${this.stats.species}_2`
        ]
    }
    @action train(stat) {
        this.stats[stat] +=5
        this.setStore()
    }
    @action death() {
        this.stats = {
            offense: 3,
            defense: 3,
            speed: 3,
            brains: 3,
            stage: 1,
            species: 'botamon',
            version: 'v1'
        }
        this.needs =  {
            sick: 0,
            hunger: 0,
            evolving: 0
        }
        this.lifeCounter = 20
        this.isDead = true
    }

    setStore = () => {
        localStorage.setItem('store', JSON.stringify(toJS(this)))
    }
}