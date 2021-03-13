import React, { Component } from 'react'
import './Title.css'


interface Idata{
    title?: string
}

interface Props{
    page? : string,
    role?: string
}

interface State{
    title?: string
}

class Title extends Component<Props,State>{
    constructor(props:Props){
        super(props);
        this.state = {
            title: ''
        }
    }

    componentDidMount(){
        switch(this.props.role){
            case 'student':{
                if(this.props.page === 'Моя курсовая детально'){
                    return(this.setState({title : 'Текущая курсовая'}))
                }

                if(this.props.page!.indexOf('completed_') + 1){
                    return this.setState({title : 'Завершенная курсовая'})
                }

                if(this.props.page!.indexOf('request') + 1){
                    return this.setState({title : 'Моя заявка'})
                }
                    

                if(this.props.page!.indexOf('free') + 1){
                    return  this.setState({title : 'Свободная курсовая'})
                }
                    

                if(this.props.page!.indexOf('bidding') + 1){
                    return this.setState({title : 'Рецензируемая курсовая'})
                }

                if(this.props.page!.indexOf('requireCritic') + 1){
                    return  this.setState({title : 'Курсовая, требующая рецензии'})
                }
                
                return this.setState({title : this.props.page})   
            }
            case 'teacher':{
                switch(this.props.page){
                    case 'Занятые':
                        return this.setState({title : 'Студенты, у которых я научный руководитель'})

                    case 'Свободные':
                        return this.setState({title : 'Предложенные мной курсовые'})

                    case 'Заявки':
                        return this.setState({title : 'Текущие заявки'})

                    case 'Завершенные':
                        return this.setState({title : 'Завершенные работы'})

                    default:{
                        if(this.props.page!.indexOf('current') + 1){
                            return this.setState({title : 'Текущая курсовая'})
                        }
                    
                        if(this.props.page!.indexOf('free') + 1){
                            return this.setState({title : 'Моя свободная курсовая'})
                        }

                        if(this.props.page!.indexOf('completed') + 1){
                            return this.setState({title : 'Моя завершенная курсовая'})
                        }

                        if(this.props.page!.indexOf('request') + 1)
                            return this.setState({title : 'Текущая заявка'})

                        if(this.props.page!.indexOf('foreign') + 1){
                            return this.setState({title : 'Свободная курсовая'})
                        }

                        if(this.props.page!.indexOf('requireCritic') + 1){
                            return this.setState({title : 'Курсовая, требующая рецензии'})
                        }

                        if(this.props.page!.indexOf('bidding') + 1){
                            return this.setState({title : 'Рецензируемая курсовая'})
                        }

                        return  this.setState({title : this.props.page})
                    }
                }
            }
            case 'curator':{
                if(this.props.page === 'Предложенные темы')
                    return this.setState({title : 'Предложенные мной темы'})

                if(this.props.page!.indexOf('current') + 1){
                    return this.setState({title : 'Занятая курсовая'})
                }

                if(this.props.page!.indexOf('curatorBusy') + 1){
                    return this.setState({title : 'Моя занятая курсовая'})
                }

                if(this.props.page!.indexOf('curatorFree') + 1){
                    return this.setState({title : 'Моя свободная курсовая'})
                }

                if(this.props.page!.indexOf('curatorSt') + 1)
                    return this.setState({title : 'Текущая заявка'})

                if(this.props.page === 'Биддинг')
                    return this.setState({title : 'Результаты биддинга'})

                return this.setState({title : this.props.page})
            }
        }
    }

    componentDidUpdate(prevProps : Props){
        if(this.props !== prevProps){
            this.componentDidMount()  
        }
    }

    private renderTitle(){
        return <p className='title-text'>{this.state.title}</p>
    }

    render(){
    return(
        <div className='title'>
            {this.renderTitle()}
            <hr/>
        </div>
    )
    }
}

export default Title