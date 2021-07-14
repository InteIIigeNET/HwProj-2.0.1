import React, { Component } from 'react'
import './ContentBar.css'

import studentContentBarData from '../../../../../TestData/Student/ContentBarData'
import teacherContentBarData from '../../../../../TestData/Teacher/ContentBarData'
import curatorContentBarWorks from '../../../../../TestData/Curator/WorksContentBar'

interface Idata{
    section?: string,
    selected?: boolean
}

interface Props{
    page?: string,
    changePage(event : React.MouseEvent<HTMLButtonElement>) : void,
    role?: string
}

interface State{
    items: Idata[]
}

class ContentBar extends Component<Props,State>{
    constructor(props : Props){
        super(props);
        switch(this.props.role){
            case 'student':{this.state = {items : studentContentBarData}; break}
            case 'teacher':{this.state = {items : teacherContentBarData}; break}
            case 'curator':{this.state = {items : curatorContentBarWorks};break}
        }
    }

    isSelected(section?:string){
        return (section === this.props.page)? 'btnSelected' : ' '
    }

    changeBarItem = (event : React.MouseEvent<HTMLButtonElement>) => {
        const newBarItem = event.currentTarget.value
        let arr = this.state.items.map(item => {
            if(item.section === newBarItem)
                item.selected = true
            else item.selected = false
            return item
        })
        this.props.changePage(event)
        return(this.setState({items:arr}))
    }

    private renderContentBar(){
        return(
            <div className='contentBar'>
                {this.state.items.map(item => 
                    <button
                        key={item.section}
                        onClick={this.changeBarItem} 
                        className={'button '+ this.isSelected(item.section)}
                        value={item.section}
                    >{item.section}
                    </button>)}
            </div>
        )
    }

    render(){
        return this.renderContentBar();
    }
}

export default ContentBar